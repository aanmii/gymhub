import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { user, isAdmin, isEmployee, isMember } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Welcome to GymHub
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Hello, {user?.firstName}!
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Role:</span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {user?.role}
                    </span>
                  </div>

                  {user?.locationName && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Location:</span>
                      <span className="ml-2 text-sm text-gray-900">{user.locationName}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      {isAdmin && (
                        <div>
                          <a
                            href="/admin"
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            → Go to Admin Panel
                          </a>
                        </div>
                      )}
                      {isEmployee && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Employee dashboard coming soon...
                          </p>
                        </div>
                      )}
                      {isMember && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Member dashboard coming soon...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};