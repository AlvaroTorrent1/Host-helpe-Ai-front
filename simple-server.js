// simple-server.js - Servidor de desarrollo simplificado
console.log('Iniciando servidor simple...');

try {
  const express = require('express');
  const cors = require('cors');
  
  console.log('Express y CORS cargados correctamente');
  
  const app = express();
  const port = 3001;
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Endpoint de salud
  app.get('/health', (req, res) => {
    console.log('Health check solicitado');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Servidor funcionando'
    });
  });
  
  // Endpoint para payment intent (versión simplificada)
  app.post('/functions/v1/create-payment-intent', (req, res) => {
    console.log('Payment intent solicitado:', req.body);
    
    // En esta versión simplificada, solo simularemos una respuesta
    res.json({
      clientSecret: 'pi_test_1234567890_secret_test',
      paymentIntentId: 'pi_test_1234567890'
    });
  });
  
  // Iniciar servidor
  app.listen(port, () => {
    console.log(`✅ Servidor iniciado en http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`Payment endpoint: http://localhost:${port}/functions/v1/create-payment-intent`);
  });
  
} catch (error) {
  console.error('❌ Error iniciando servidor:', error);
  process.exit(1);
} 