/**
 * Componente LoadingScreen
 * Muestra una pantalla de carga mientras se realizan operaciones asíncronas
 */

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-700 text-lg font-medium">Cargando...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
