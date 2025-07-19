'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser, User } from '@/lib/auth';
import { userService, UserStatistics } from '@/lib/user-service';
import { customerService, CustomerStatistics } from '@/lib/customer-service';
import { 
  Crown,
  Users, 
  UserPlus,
  Settings,
  BarChart3,
  LogOut,
  Shield,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    console.log('Usuario obtenido:', currentUser); // Debug
    
    if (!currentUser) {
      console.log('No hay usuario, redirigiendo a login');
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'SUPERADMIN') {
      console.log('Usuario no es SUPERADMIN, redirigiendo a dashboard normal');
      router.push('/dashboard');
      return;
    }
    console.log('Usuario SUPERADMIN confirmado:', currentUser.fullName);
    setUser(currentUser);
  }, [router]);

  useEffect(() => {
    if (user && user.role === 'SUPERADMIN') {
      loadStatistics();
    }
  }, [user]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Intentando cargar estadísticas...');
      
      // Cargar estadísticas por separado para mejor debugging
      let userStatsData = null;
      let customerStatsData = null;
      
      try {
        console.log('Cargando estadísticas de usuarios...');
        userStatsData = await userService.getUserStatistics();
        console.log('Estadísticas de usuarios cargadas:', userStatsData);
      } catch (userError: any) {
        console.error('Error cargando estadísticas de usuarios:', userError);
        setError(`Error en estadísticas de usuarios: ${userError.message}`);
      }
      
      try {
        console.log('Cargando estadísticas de clientes...');
        customerStatsData = await customerService.getCustomerStatistics();
        console.log('Estadísticas de clientes cargadas:', customerStatsData);
      } catch (customerError: any) {
        console.error('Error cargando estadísticas de clientes:', customerError);
        if (!error) { // Solo set si no hay error previo
          setError(`Error en estadísticas de clientes: ${customerError.message}`);
        }
      }
      
      setUserStats(userStatsData);
      setCustomerStats(customerStatsData);
      setStatsLoaded(true);
      
    } catch (err: any) {
      console.error('Error general cargando estadísticas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Crown className="h-8 w-8 mr-3 text-yellow-600" />
                Panel de Administración
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                <Shield className="h-4 w-4 mr-1" />
                Bienvenido, {user.fullName} (SUPERADMIN)
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={loadStatistics}
                    className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <button
                onClick={() => router.push('/admin/users')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300 text-left"
              >
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Gestionar Usuarios</h3>
                    <p className="text-xs text-gray-500">Crear, editar y administrar usuarios</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/customers')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-green-300 text-left"
              >
                <div className="flex items-center">
                  <UserPlus className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Gestionar Clientes</h3>
                    <p className="text-xs text-gray-500">Ver y administrar todos los clientes</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/customers/statistics')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300 text-left"
              >
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Estadísticas</h3>
                    <p className="text-xs text-gray-500">Reportes y análisis del sistema</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/settings')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-400 text-left"
              >
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-gray-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Configuración</h3>
                    <p className="text-xs text-gray-500">Ajustes del sistema</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando estadísticas...</p>
            </div>
          ) : (
            <>
              {/* User Statistics */}
              {userStats && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Estadísticas de Usuarios
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Total Usuarios
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {userStats.totalUsers}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <UserCheck className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Usuarios Activos
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {userStats.activeUsers}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <UserX className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Usuarios Inactivos
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {userStats.inactiveUsers}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Shield className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Administradores
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {userStats.adminUsers}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Statistics */}
              {customerStats && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Estadísticas de Clientes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <UserPlus className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Total Clientes
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {customerStats.totalCustomers}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Este Mes
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {customerStats.customersCreatedThisMonth}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Calendar className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Esta Semana
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {customerStats.customersCreatedThisWeek}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Activity className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Promedio Direcciones
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {customerStats.averageAddressesPerCustomer?.toFixed(1) || '0.0'}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show message if no stats loaded */}
              {!userStats && !customerStats && !loading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                    <p className="text-sm text-yellow-700">
                      No se pudieron cargar las estadísticas. Los botones de acciones rápidas siguen funcionando.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Recent Activity Placeholder */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sistema OrionTek</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800">¡Panel de administración activo!</h3>
                <p className="text-sm text-blue-600 mt-1">
                  Tienes acceso completo como SUPERADMIN para gestionar usuarios y clientes.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  Funcionalidades disponibles
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Gestión completa de usuarios ADMIN</li>
                  <li>• Supervisión de todos los clientes del sistema</li>
                  <li>• Estadísticas y reportes globales</li>
                  <li>• Activación y desactivación de usuarios</li>
                  <li>• Monitoreo de actividad por usuario</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}