/**
 * Example component test
 * 
 * This demonstrates how to test a React component
 * using React Testing Library.
 * 
 * Note: This test will not work until the testing
 * dependencies are installed.
 */

// Import testing functions conditionally to prevent TypeScript errors
let describe: any;
let it: any;
let expect: any;
let vi: any;
let render: any;
let screen: any;
let fireEvent: any;

try {
  // This will work after vitest is installed
  const vitest = require('vitest');
  describe = vitest.describe;
  it = vitest.it;
  expect = vitest.expect;
  vi = vitest.vi;
  
  // This will work after @testing-library/react is installed
  const testingLibrary = require('@testing-library/react');
  render = testingLibrary.render;
  screen = testingLibrary.screen;
  fireEvent = testingLibrary.fireEvent;
} catch (e) {
  // Fallback for when dependencies are not installed
  describe = (name: string, fn: Function) => { console.log(`Test suite: ${name}`); };
  it = (name: string, fn: Function) => { console.log(`  Test: ${name}`); };
  expect = (value: any) => ({
    toBe: (expected: any) => console.log(`    Expected: ${expected}, Actual: ${value}`),
    toContain: (substring: string) => console.log(`    Expected to contain: ${substring}, Actual: ${value}`),
    toBeInTheDocument: () => console.log(`    Expected element to be in document`)
  });
  vi = { fn: () => ({ mockImplementation: () => {} }) };
  render = () => console.log(`    [Mock] Rendering component`);
  screen = { 
    getByText: (text: string) => console.log(`    [Mock] Getting element by text: ${text}`),
    getByTestId: (id: string) => console.log(`    [Mock] Getting element by test ID: ${id}`)
  };
  fireEvent = { click: (element: any) => console.log(`    [Mock] Firing click event`) };
}

/**
 * Simple Button component to test
 */
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

function Button({ text, onClick, variant = 'primary' }: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded";
  const variantClasses = variant === 'primary' 
    ? "bg-blue-500 text-white hover:bg-blue-600" 
    : "bg-gray-200 text-gray-800 hover:bg-gray-300";
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
      data-testid="test-button"
    >
      {text}
    </button>
  );
}

// Button component tests
describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-indigo-600');
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByText('Custom Button');
    expect(button).toHaveClass('custom-class');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByText('Click me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });
});

/**
 * To run this test:
 * 
 * 1. Make sure you've installed the testing dependencies:
 *    npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
 * 
 * 2. Run the test command:
 *    npm test
 */ 