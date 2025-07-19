'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser, User } from '@/lib/auth';
import { customerService, CustomerStatistics } from '@/lib/customer-service';
import { 
  Users, 
  UserPlus,
  BarChart3,
  LogOut,
  Shield,
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle,
  PlusCircle,
  Search,
  Settings
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    console.log('Usuario obtenido:', currentUser);
    
    if (!currentUser) {
      console.log('No hay usuario, redirigiendo a login');
      router.push('/login');
      return;
    }
    
    // Solo usuarios ADMIN pueden acceder (no SUPERADMIN)
    if (currentUser.role !== 'ADMIN') {
      console.log('Usuario no es ADMIN, redirigiendo según rol');
      if (currentUser.role === 'SUPERADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/login');
      }
      return;
    }
    
    console.log('Usuario ADMIN confirmado:', currentUser.fullName);
    setUser(currentUser);
  }, [router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadStatistics();
    }
  }, [user]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando estadísticas de clientes para ADMIN...');
      
      try {
        const customerStatsData = await customerService.getCustomerStatistics();
        console.log('Estadísticas de clientes cargadas:', customerStatsData);
        setCustomerStats(customerStatsData);
      } catch (customerError: any) {
        console.error('Error cargando estadísticas de clientes:', customerError);
        setError(`Error cargando estadísticas: ${customerError.message}`);
      }
      
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
                <Shield className="h-8 w-8 mr-3 text-blue-600" />
                Panel de Administración
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                <Users className="h-4 w-4 mr-1" />
                Bienvenido, {user.fullName} (ADMIN)
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

          {/* Welcome Message */}
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h2 className="text-lg font-medium text-blue-900">
                    ¡Bienvenido al sistema OrionTek!
                  </h2>
                  <p className="text-blue-700 mt-1">
                    Como usuario ADMIN, puedes gestionar clientes y sus direcciones.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <button
                onClick={() => router.push('/customers')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-green-300 text-left"
              >
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Ver Clientes</h3>
                    <p className="text-xs text-gray-500">Listar y gestionar clientes</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/customers?action=create')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300 text-left"
              >
                <div className="flex items-center">
                  <PlusCircle className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Nuevo Cliente</h3>
                    <p className="text-xs text-gray-500">Agregar cliente al sistema</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/customers?search=true')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300 text-left"
              >
                <div className="flex items-center">
                  <Search className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Buscar Cliente</h3>
                    <p className="text-xs text-gray-500">Encontrar cliente específico</p>
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
          ) : customerStats ? (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Mis Estadísticas
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
                            Clientes Activos
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {customerStats.activeCustomers}
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
                            Gestionados
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {customerStats.managedCustomers || customerStats.totalCustomers}
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
          ) : null}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* My Responsibilities */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Mis Responsabilidades
              </h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Gestión de Clientes</p>
                    <p className="text-sm text-gray-500">Crear, editar y administrar clientes</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Direcciones</p>
                    <p className="text-sm text-gray-500">Administrar direcciones de clientes</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Seguimiento</p>
                    <p className="text-sm text-gray-500">Monitorear actividad de mis clientes</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Acceso Rápido
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/customers')}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Lista de Clientes</p>
                      <p className="text-xs text-gray-500">Ver todos mis clientes</p>
                    </div>
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
                
                <button
                  onClick={() => router.push('/customers?action=create')}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Agregar Cliente</p>
                      <p className="text-xs text-gray-500">Registrar nuevo cliente</p>
                    </div>
                    <PlusCircle className="h-5 w-5 text-gray-400" />
                  </div>
                </button>

                <div className="px-4 py-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Configuración</p>
                      <p className="text-xs text-gray-500">Próximamente disponible</p>
                    </div>
                    <Settings className="h-5 w-5 text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información del Usuario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Perfil</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Nombre:</dt>
                    <dd className="text-gray-900">{user.fullName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Email:</dt>
                    <dd className="text-gray-900">{user.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Rol:</dt>
                    <dd className="text-gray-900">{user.role}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Estado:</dt>
                    <dd className="text-green-600">{user.active ? 'Activo' : 'Inactivo'}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Permisos</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✅ Crear clientes</li>
                  <li>✅ Editar clientes</li>
                  <li>✅ Gestionar direcciones</li>
                  <li>✅ Ver estadísticas propias</li>
                  <li>❌ Gestionar usuarios</li>
                  <li>❌ Acceso de SUPERADMIN</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}