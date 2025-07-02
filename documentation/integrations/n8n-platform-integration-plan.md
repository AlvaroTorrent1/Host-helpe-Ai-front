# Host Helper AI - n8n Platform Integration Plan

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Implementation Ready

## Executive Summary

This document outlines the comprehensive integration plan for connecting n8n agents with the Host Helper AI Supabase backend. The integration will enable each property owner to have a dedicated n8n agent that manages property data, reservation information, and incident reporting through automated workflows.

## Current State Analysis

### ✅ What We Have
- n8n agents built and connected to test environment
- Successful connection between test agents and Supabase
- Property creation system with image/document upload functionality
- Reservation management system with multi-guest support
- Dashboard with incidents section for conversation data
- Database schema supporting:
  - Properties with media and documents
  - Multi-guest reservations
  - User authentication and ownership

### 🎯 Integration Goals
- Connect property creation form to n8n workflows
- Enable reservation data flow to n8n agents
- Implement incident reporting from agent conversations
- Create one-to-one mapping between property owners and n8n agents
- Establish bidirectional data synchronization

## Phase 1: Database Schema Enhancement

### 1.1 Create n8n Agent Mapping Table

```sql
-- Create agent mapping table
CREATE TABLE IF NOT EXISTS public.n8n_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL UNIQUE, -- n8n workflow/agent identifier
  agent_name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_n8n_agents_user_id ON public.n8n_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_n8n_agents_agent_id ON public.n8n_agents(agent_id);

-- RLS Policies
ALTER TABLE public.n8n_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY n8n_agents_policy ON public.n8n_agents 
  FOR ALL USING (user_id = auth.uid());
```

### 1.2 Enhance Incidents Table

```sql
-- Create incidents table for agent conversation data
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  n8n_agent_id UUID REFERENCES public.n8n_agents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'check-in-out', 'property-issue', 'tourist-info', 'emergency', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  guest_name TEXT,
  guest_phone TEXT,
  conversation_data JSONB,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_property_id ON public.incidents(property_id);
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON public.incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at);

-- RLS Policies
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY incidents_policy ON public.incidents 
  FOR ALL USING (user_id = auth.uid());
```

### 1.3 Add Agent Reference to Properties

```sql
-- Add n8n agent reference to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS n8n_agent_id UUID REFERENCES public.n8n_agents(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_properties_n8n_agent_id ON public.properties(n8n_agent_id);
```

## Phase 2: Backend Service Layer

### 2.1 Create n8n Service

```typescript
// src/services/n8nService.ts
interface N8nAgent {
  id: string;
  userId: string;
  agentId: string;
  agentName: string;
  webhookUrl: string;
  apiKey: string;
  status: 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
}

interface N8nWebhookPayload {
  type: 'property_created' | 'property_updated' | 'reservation_created' | 'reservation_updated';
  data: any;
  userId: string;
  propertyId?: string;
  reservationId?: string;
}

class N8nService {
  private baseUrl: string;
  private defaultApiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_N8N_INSTANCE_URL;
    this.defaultApiKey = import.meta.env.VITE_N8N_API_KEY;
  }

  // Create new agent for user
  async createAgentForUser(userId: string, userEmail: string): Promise<N8nAgent> {
    const agentData = {
      name: `Agent_${userEmail.split('@')[0]}_${Date.now()}`,
      userId,
      webhookPath: `host-helper/${userId}`
    };

    // Call n8n API to create workflow/agent
    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.defaultApiKey
      },
      body: JSON.stringify(this.getAgentWorkflowTemplate(agentData))
    });

    if (!response.ok) {
      throw new Error('Failed to create n8n agent');
    }

    const workflowData = await response.json();
    
    // Store agent info in Supabase
    const { data, error } = await supabase
      .from('n8n_agents')
      .insert({
        user_id: userId,
        agent_id: workflowData.id,
        agent_name: agentData.name,
        webhook_url: `${this.baseUrl}/webhook/${agentData.webhookPath}`,
        api_key: this.generateApiKey(),
        configuration: {
          workflowId: workflowData.id,
          created: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Send data to agent webhook
  async sendToAgent(agentId: string, payload: N8nWebhookPayload): Promise<boolean> {
    const { data: agent } = await supabase
      .from('n8n_agents')
      .select('webhook_url, api_key')
      .eq('agent_id', agentId)
      .single();

    if (!agent) return false;

    const response = await fetch(agent.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent.api_key}`
      },
      body: JSON.stringify(payload)
    });

    return response.ok;
  }

  // Receive incident data from agent
  async receiveIncidentFromAgent(agentId: string, incidentData: any): Promise<string> {
    // Validate agent
    const { data: agent } = await supabase
      .from('n8n_agents')
      .select('user_id')
      .eq('agent_id', agentId)
      .single();

    if (!agent) throw new Error('Agent not found');

    // Create incident
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        property_id: incidentData.propertyId,
        user_id: agent.user_id,
        n8n_agent_id: agentId,
        title: incidentData.title,
        description: incidentData.description,
        category: incidentData.category,
        guest_name: incidentData.guestName,
        guest_phone: incidentData.guestPhone,
        conversation_data: incidentData.conversationData
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private getAgentWorkflowTemplate(agentData: any) {
    return {
      name: agentData.name,
      nodes: [
        {
          name: "Webhook",
          type: "n8n-nodes-base.webhook",
          parameters: {
            path: agentData.webhookPath,
            httpMethod: "POST"
          }
        },
        {
          name: "Process Property Data",
          type: "n8n-nodes-base.code",
          parameters: {
            jsCode: `
              const payload = $input.first().json;
              
              if (payload.type === 'property_created') {
                // Process new property
                return [{
                  json: {
                    action: 'property_configured',
                    propertyId: payload.data.id,
                    userId: payload.userId
                  }
                }];
              }
              
              return [{ json: payload }];
            `
          }
        },
        {
          name: "Supabase Integration",
          type: "n8n-nodes-base.supabase",
          parameters: {
            operation: "insert",
            table: "agent_logs"
          }
        }
      ]
    };
  }

  private generateApiKey(): string {
    return `hh_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }
}

export default new N8nService();
```

### 2.2 Create Incident Service

```typescript
// src/services/incidentService.ts
interface Incident {
  id: string;
  propertyId: string;
  userId: string;
  title: string;
  description?: string;
  category: 'check-in-out' | 'property-issue' | 'tourist-info' | 'emergency' | 'other';
  status: 'pending' | 'resolved';
  guestName?: string;
  guestPhone?: string;
  conversationData?: any;
  createdAt: string;
}

class IncidentService {
  async getIncidentsForUser(userId: string): Promise<Incident[]> {
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        property:properties(title, address)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createIncident(incidentData: Partial<Incident>): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .insert(incidentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resolveIncident(incidentId: string, resolutionNotes?: string): Promise<void> {
    const { error } = await supabase
      .from('incidents')
      .update({
        status: 'resolved',
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString()
      })
      .eq('id', incidentId);

    if (error) throw error;
  }
}

export default new IncidentService();
```

## Phase 3: Frontend Integration

### 3.1 Property Form Enhancement

```typescript
// src/features/properties/PropertyFormWithN8n.tsx
import n8nService from '@services/n8nService';

const PropertyFormWithN8n: React.FC<PropertyFormProps> = ({ onSubmit, ...props }) => {
  const { user } = useAuth();

  const handleSubmit = async (propertyData: PropertyFormData) => {
    try {
      // Create property first
      const property = await onSubmit(propertyData);
      
      // Get or create user's n8n agent
      let agent = await n8nService.getAgentForUser(user.id);
      if (!agent) {
        agent = await n8nService.createAgentForUser(user.id, user.email);
      }

      // Send property data to n8n agent
      await n8nService.sendToAgent(agent.agentId, {
        type: 'property_created',
        data: {
          ...property,
          images: propertyData.images?.map(img => ({
            url: img.url,
            type: img.type,
            fileName: img.fileName
          })),
          documents: propertyData.documents?.map(doc => ({
            url: doc.url,
            name: doc.name,
            type: doc.type
          })),
          links: propertyData.links || []
        },
        userId: user.id,
        propertyId: property.id
      });

      toast.success('Property created and synced with AI agent');
    } catch (error) {
      console.error('Error syncing with n8n:', error);
      toast.error('Property created but sync failed. Please try again.');
    }
  };

  return <PropertyForm {...props} onSubmit={handleSubmit} />;
};
```

### 3.2 Reservation Form Enhancement

```typescript
// src/features/reservations/ReservationFormWithN8n.tsx
import n8nService from '@services/n8nService';

const ReservationFormWithN8n: React.FC<ReservationFormProps> = ({ onSubmit, ...props }) => {
  const { user } = useAuth();

  const handleSubmit = async (reservationData: ReservationCreateData) => {
    try {
      // Create reservation first
      const reservation = await onSubmit(reservationData);
      
      // Get property owner's n8n agent
      const { data: property } = await supabase
        .from('properties')
        .select('n8n_agent_id, owner_id')
        .eq('id', reservationData.propertyId)
        .single();

      if (property?.n8n_agent_id) {
        // Send reservation data to property owner's agent
        await n8nService.sendToAgent(property.n8n_agent_id, {
          type: 'reservation_created',
          data: {
            ...reservation,
            guests: [
              reservation.mainGuest,
              ...reservation.guests
            ].map(guest => ({
              firstName: guest.firstName,
              lastName: guest.lastName,
              phone: guest.phone,
              documentType: guest.documentType,
              documentNumber: guest.documentNumber,
              birthDate: guest.birthDate,
              nationality: guest.nationality
            }))
          },
          userId: property.owner_id,
          propertyId: reservationData.propertyId,
          reservationId: reservation.id
        });
      }

      toast.success('Reservation created and synced with AI agent');
    } catch (error) {
      console.error('Error syncing reservation with n8n:', error);
      toast.error('Reservation created but sync failed.');
    }
  };

  return <ReservationForm {...props} onSubmit={handleSubmit} />;
};
```

### 3.3 Dashboard Incidents Integration

```typescript
// src/features/dashboard/IncidentsSection.tsx
import incidentService from '@services/incidentService';

const IncidentsSection: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const userIncidents = await incidentService.getIncidentsForUser(user.id);
        setIncidents(userIncidents);
      } catch (error) {
        console.error('Error loading incidents:', error);
        toast.error('Failed to load incidents');
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
    
    // Set up real-time subscription for new incidents
    const subscription = supabase
      .channel('incidents')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'incidents',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setIncidents(prev => [payload.new as Incident, ...prev]);
        toast.success('New incident received from AI agent');
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  const handleResolveIncident = async (incidentId: string, notes?: string) => {
    try {
      await incidentService.resolveIncident(incidentId, notes);
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId 
            ? { ...incident, status: 'resolved' }
            : incident
        )
      );
      toast.success('Incident resolved');
    } catch (error) {
      console.error('Error resolving incident:', error);
      toast.error('Failed to resolve incident');
    }
  };

  return (
    <div className="incidents-section">
      <h3>Recent Incidents</h3>
      {loading ? (
        <div>Loading incidents...</div>
      ) : (
        <div className="incidents-list">
          {incidents.map(incident => (
            <IncidentCard 
              key={incident.id}
              incident={incident}
              onResolve={handleResolveIncident}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

## Phase 4: n8n Workflow Configuration

### 4.1 Agent Creation Workflow

```json
{
  "name": "Create User Agent",
  "nodes": [
    {
      "name": "User Registration Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "create-agent",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Validate User Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const userData = $input.first().json;\nif (!userData.userId || !userData.email) {\n  throw new Error('Invalid user data');\n}\nreturn [{ json: userData }];"
      }
    },
    {
      "name": "Create Agent Workflow",
      "type": "n8n-nodes-base.n8n",
      "parameters": {
        "operation": "create",
        "resource": "workflow",
        "workflowObject": {
          "name": "={{ 'Agent_' + $json.email.split('@')[0] + '_' + new Date().getTime() }}",
          "nodes": "={{ $json.agentTemplate }}"
        }
      }
    },
    {
      "name": "Store Agent in Supabase",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "insert",
        "table": "n8n_agents"
      }
    }
  ]
}
```

### 4.2 Property Data Processing Workflow

```json
{
  "name": "Property Agent Template",
  "nodes": [
    {
      "name": "Property Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "property-data",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Process Property",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const property = $input.first().json.data;\nconst processed = {\n  ...property,\n  aiContext: {\n    description: property.description,\n    amenities: property.amenities,\n    location: property.address,\n    images: property.images,\n    documents: property.documents\n  }\n};\nreturn [{ json: processed }];"
      }
    },
    {
      "name": "Store in Agent Memory",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "insert",
        "table": "agent_property_context"
      }
    }
  ]
}
```

### 4.3 Guest Conversation Workflow

```json
{
  "name": "Guest Conversation Handler",
  "nodes": [
    {
      "name": "Guest Message",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "guest-conversation",
        "httpMethod": "POST"
      }
    },
    {
      "name": "AI Response",
      "type": "n8n-nodes-base.openai",
      "parameters": {
        "operation": "text",
        "model": "gpt-4",
        "prompt": "You are a helpful property assistant. Guest message: {{ $json.message }}"
      }
    },
    {
      "name": "Categorize Conversation",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const message = $input.first().json.message;\nlet category = 'other';\nif (message.toLowerCase().includes('check')) category = 'check-in-out';\nelse if (message.toLowerCase().includes('problem')) category = 'property-issue';\nelse if (message.toLowerCase().includes('emergency')) category = 'emergency';\nreturn [{ json: { ...message, category } }];"
      }
    },
    {
      "name": "Create Incident",
      "type": "n8n-nodes-base.http-request",
      "parameters": {
        "method": "POST",
        "url": "{{ $env.SUPABASE_URL }}/rest/v1/incidents",
        "headers": {
          "apikey": "{{ $env.SUPABASE_KEY }}",
          "Authorization": "Bearer {{ $env.SUPABASE_KEY }}"
        }
      }
    }
  ]
}
```

## Phase 5: Testing & Deployment

### 5.1 Integration Testing

```typescript
// src/tests/integration/n8nIntegration.test.ts
describe('n8n Integration', () => {
  test('should create agent for new user', async () => {
    const user = await createTestUser();
    const agent = await n8nService.createAgentForUser(user.id, user.email);
    
    expect(agent).toBeDefined();
    expect(agent.userId).toBe(user.id);
    expect(agent.webhookUrl).toContain('host-helper');
  });

  test('should sync property data to agent', async () => {
    const property = await createTestProperty();
    const result = await n8nService.sendToAgent(property.agentId, {
      type: 'property_created',
      data: property,
      userId: property.ownerId
    });
    
    expect(result).toBe(true);
  });

  test('should receive incident from agent', async () => {
    const incidentData = {
      propertyId: 'test-property-id',
      title: 'Test Incident',
      category: 'other',
      guestName: 'John Doe'
    };
    
    const incidentId = await n8nService.receiveIncidentFromAgent(
      'test-agent-id', 
      incidentData
    );
    
    expect(incidentId).toBeDefined();
  });
});
```

### 5.2 Deployment Steps

1. **Database Migration**
   ```bash
   # Apply database changes
   supabase db push
   ```

2. **n8n Workflow Deployment**
   ```bash
   # Deploy workflows to n8n instance
   n8n import:workflow --file=workflows/agent-template.json
   ```

3. **Environment Configuration**
   ```bash
   # Update environment variables
   VITE_N8N_INSTANCE_URL=https://your-n8n-instance.com
   VITE_N8N_API_KEY=your-n8n-api-key
   ```

4. **Service Integration**
   ```bash
   # Deploy updated services
   npm run build
   npm run deploy
   ```

## Phase 6: Monitoring & Maintenance

### 6.1 Health Checks

```typescript
// src/services/healthCheckService.ts
class HealthCheckService {
  async checkN8nAgentHealth(agentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${n8nConfig.instanceUrl}/api/v1/workflows/${agentId}`, {
        headers: { 'X-N8N-API-KEY': n8nConfig.apiKey }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async monitorAgentConnections(): Promise<void> {
    const { data: agents } = await supabase
      .from('n8n_agents')
      .select('agent_id, user_id')
      .eq('status', 'active');

    for (const agent of agents || []) {
      const isHealthy = await this.checkN8nAgentHealth(agent.agent_id);
      if (!isHealthy) {
        await this.markAgentAsError(agent.agent_id);
        // Notify admin
      }
    }
  }

  private async markAgentAsError(agentId: string): Promise<void> {
    await supabase
      .from('n8n_agents')
      .update({ status: 'error' })
      .eq('agent_id', agentId);
  }
}
```

### 6.2 Error Handling & Recovery

```typescript
// src/services/errorRecoveryService.ts
class ErrorRecoveryService {
  async retryFailedSync(type: string, data: any, agentId: string): Promise<void> {
    const maxRetries = 3;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        await n8nService.sendToAgent(agentId, { type, data });
        break;
      } catch (error) {
        attempts++;
        if (attempts === maxRetries) {
          // Store for manual review
          await this.storeFailedSync(type, data, agentId, error);
        }
        await this.delay(1000 * attempts); // Exponential backoff
      }
    }
  }

  private async storeFailedSync(type: string, data: any, agentId: string, error: any): Promise<void> {
    await supabase
      .from('sync_failures')
      .insert({
        type,
        data,
        agent_id: agentId,
        error_message: error.message,
        retry_count: 3
      });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Success Metrics

### Key Performance Indicators
- **Agent Creation Rate**: 95% success rate for new user agent creation
- **Data Sync Success**: 98% success rate for property/reservation sync
- **Incident Processing**: 100% of agent conversations converted to incidents
- **Response Time**: <2 seconds for webhook processing
- **Uptime**: 99.5% availability for n8n integration

### Monitoring Dashboard
- Real-time agent health status
- Sync failure alerts
- Incident creation trends
- Performance metrics visualization

## Security Considerations

### Data Protection
- All webhooks use HTTPS with API key authentication
- Sensitive data encrypted at rest and in transit
- Agent API keys rotated every 90 days
- Audit logging for all n8n communications

### Access Control
- Row-level security on all database tables
- Agent access limited to owner's data only
- Webhook endpoints rate-limited
- API key validation on all requests

## Conclusion

This integration plan provides a comprehensive roadmap for connecting the Host Helper AI platform with n8n agents. The phased approach ensures minimal disruption to existing functionality while adding powerful AI automation capabilities.

The implementation will enable:
- Seamless property data flow to AI agents
- Automated reservation processing
- Real-time incident reporting from guest conversations
- Scalable agent management per property owner
- Robust error handling and monitoring

Timeline: 4-6 weeks for full implementation
Resources: 2 backend developers, 1 frontend developer, 1 n8n specialist