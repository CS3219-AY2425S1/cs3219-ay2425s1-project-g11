const LoadingSpinner = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-100"></div>
    </div>
  );
};

export default LoadingSpinner;
