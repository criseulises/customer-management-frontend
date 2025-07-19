'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/lib/auth';
import { customerService, CustomerStatistics } from '@/lib/customer-service';
import { userService, UserStatistics } from '@/lib/user-service';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Calendar,
  ArrowLeft,
  BarChart3,
  PieChart,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Home
} from 'lucide-react';

interface ExtendedStatistics {
  customers: CustomerStatistics;
  users?: UserStatistics;
  recentActivity?: {
    newCustomersToday: number;
    newCustomersThisWeek: number;
    newCustomersThisMonth: number;
  };
  addressStats?: {
    averageAddressesPerCustomer: number;
    mostCommonAddressType: string;
    citiesCount: number;
  };
}

export default function CustomerStatisticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [statistics, setStatistics] = useState<ExtendedStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadStatistics();
  }, [router]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener estadísticas de clientes
      const customerStats = await customerService.getCustomerStatistics();
      
      let userStats = null;
      // Solo SUPERADMIN puede ver estadísticas de usuarios
      if (user?.role === 'SUPERADMIN') {
        try {
          userStats = await userService.getUserStatistics();
        } catch (err) {
          console.warn('No se pudieron cargar estadísticas de usuarios:', err);
        }
      }

      // Simular estadísticas adicionales (en un proyecto real vendrían del backend)
      const recentActivity = {
        newCustomersToday: Math.floor(Math.random() * 5),
        newCustomersThisWeek: Math.floor(Math.random() * 20),
        newCustomersThisMonth: Math.floor(Math.random() * 50)
      };

      const addressStats = {
        averageAddressesPerCustomer: 1.3,
        mostCommonAddressType: 'HOME',
        citiesCount: Math.floor(Math.random() * 15) + 5
      };

      setStatistics({
        customers: customerStats,
        users: userStats || undefined,
        recentActivity,
        addressStats
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActivePercentage = () => {
    if (!statistics?.customers) return 0;
    const { totalCustomers, activeCustomers } = statistics.customers;
    return totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0;
  };

  const getInactiveCustomers = () => {
    if (!statistics?.customers) return 0;
    return statistics.customers.totalCustomers - statistics.customers.activeCustomers;
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
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-8 w-8 mr-3 text-purple-600" />
                  Estadísticas de Clientes
                </h1>
                <p className="text-gray-600">
                  {user.role === 'SUPERADMIN' 
                    ? 'Análisis completo del sistema' 
                    : 'Análisis de mis clientes administrados'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customers')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Ver Clientes
              </button>
              <button
                onClick={() => router.push(user.role === 'SUPERADMIN' ? '/admin/dashboard' : '/dashboard')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
              <p className="text-gray-500">Cargando estadísticas...</p>
            </div>
          ) : statistics ? (
            <div className="space-y-6">
              
              {/* Métricas Principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Clientes</p>
                      <p className="text-2xl font-bold text-indigo-900">{statistics.customers.totalCustomers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Clientes Activos</p>
                      <p className="text-2xl font-bold text-indigo-900">{statistics.customers.activeCustomers}</p>
                      <p className="text-xs text-green-600">{getActivePercentage()}% del total</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Clientes Inactivos</p>
                      <p className="text-2xl font-bold text-indigo-900">{getInactiveCustomers()}</p>
                      <p className="text-xs text-red-600">{100 - getActivePercentage()}% del total</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Activity className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        {user.role === 'SUPERADMIN' ? 'Administradores' : 'Mis Clientes'}
                      </p>
                      <p className="text-2xl font-bold text-indigo-900">
                        {user.role === 'SUPERADMIN' 
                          ? (statistics.users?.admins || 0)
                          : statistics.customers.managedCustomers
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actividad Reciente */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Actividad Reciente
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nuevos clientes hoy</span>
                      <span className="text-lg font-semibold text-indigo-900">
                        {statistics.recentActivity?.newCustomersToday || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Esta semana</span>
                      <span className="text-lg font-semibold text-indigo-900">
                        {statistics.recentActivity?.newCustomersThisWeek || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Este mes</span>
                      <span className="text-lg font-semibold text-indigo-900">
                        {statistics.recentActivity?.newCustomersThisMonth || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-green-600" />
                      Estadísticas de Direcciones
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Promedio por cliente</span>
                      <span className="text-lg font-semibold text-indigo-900">
                        {statistics.addressStats?.averageAddressesPerCustomer || 1.0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tipo más común</span>
                      <span className="text-lg font-semibold text-indigo-900">
                        {statistics.addressStats?.mostCommonAddressType === 'HOME' ? 'Casa' : 
                         statistics.addressStats?.mostCommonAddressType === 'WORK' ? 'Trabajo' : 'Otro'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ciudades diferentes</span>
                      <span className="text-lg font-semibold text-indigo-900">
                        {statistics.addressStats?.citiesCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de Estado (Visual) */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                    Distribución de Clientes
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-center space-x-8">
                    {/* Visual simple de barras */}
                    <div className="text-center">
                      <div className="w-16 bg-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="bg-green-500 transition-all duration-1000"
                          style={{ 
                            height: `${Math.max(20, (statistics.customers.activeCustomers / Math.max(statistics.customers.totalCustomers, 1)) * 100)}px` 
                          }}
                        ></div>
                      </div>
                      <p className="mt-2 text-sm font-medium text-gray-700">Activos</p>
                      <p className="text-lg font-bold text-green-600">{statistics.customers.activeCustomers}</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 bg-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="bg-red-500 transition-all duration-1000"
                          style={{ 
                            height: `${Math.max(20, (getInactiveCustomers() / Math.max(statistics.customers.totalCustomers, 1)) * 100)}px` 
                          }}
                        ></div>
                      </div>
                      <p className="mt-2 text-sm font-medium text-gray-700">Inactivos</p>
                      <p className="text-lg font-bold text-red-600">{getInactiveCustomers()}</p>
                    </div>

                    {user.role === 'SUPERADMIN' && statistics.users && (
                      <div className="text-center">
                        <div className="w-16 bg-gray-200 rounded-lg overflow-hidden">
                          <div 
                            className="bg-blue-500 transition-all duration-1000"
                            style={{ 
                              height: `${Math.max(20, (statistics.users.admins || 0) * 20)}px` 
                            }}
                          ></div>
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-700">Admins</p>
                        <p className="text-lg font-bold text-blue-600">{statistics.users.admins || 0}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => router.push('/customers?action=create')}
                      className="flex items-center justify-center px-4 py-3 border border-green-300 rounded-md shadow-sm bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Nuevo Cliente
                    </button>
                    
                    <button
                      onClick={() => router.push('/customers?search=true')}
                      className="flex items-center justify-center px-4 py-3 border border-blue-300 rounded-md shadow-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <Activity className="h-5 w-5 mr-2" />
                      Buscar Cliente
                    </button>

                    <button
                      onClick={() => loadStatistics()}
                      className="flex items-center justify-center px-4 py-3 border border-purple-300 rounded-md shadow-sm bg-purple-50 text-purple-700 hover:bg-purple-100"
                    >
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Actualizar Datos
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800">
                    Datos actualizados: {new Date().toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay estadísticas disponibles</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se pudieron cargar las estadísticas del sistema.
              </p>
              <div className="mt-6">
                <button
                  onClick={loadStatistics}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}