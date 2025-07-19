'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/lib/auth';
import { 
  Settings, 
  Save, 
  ArrowLeft,
  Home,
  Shield,
  Users,
  Mail,
  Database,
  Bell,
  Lock,
  Globe,
  Server,
  Activity,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SystemSettings {
  general: {
    appName: string;
    companyName: string;
    timezone: string;
    language: string;
    contactEmail: string;
  };
  users: {
    passwordMinLength: number;
    requireSpecialChars: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    allowRegistration: boolean;
  };
  customers: {
    requiredFields: string[];
    maxAddresses: number;
    enableEmailValidation: boolean;
    enablePhoneValidation: boolean;
  };
  security: {
    jwtExpirationHours: number;
    enableAuditLogs: boolean;
    enableBackup: boolean;
    corsOrigins: string[];
  };
  notifications: {
    smtpEnabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    emailNotifications: boolean;
    alertInactiveCustomers: boolean;
    inactiveCustomerDays: number;
  };
}

export default function AdminSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      appName: 'OrionTek Customer Management',
      companyName: 'OrionTek Solutions',
      timezone: 'America/Santo_Domingo',
      language: 'es',
      contactEmail: 'admin@oriontek.com'
    },
    users: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      sessionTimeout: 24,
      maxLoginAttempts: 3,
      allowRegistration: false
    },
    customers: {
      requiredFields: ['firstName', 'lastName', 'email', 'phone'],
      maxAddresses: 5,
      enableEmailValidation: true,
      enablePhoneValidation: true
    },
    security: {
      jwtExpirationHours: 24,
      enableAuditLogs: true,
      enableBackup: true,
      corsOrigins: ['http://localhost:3000']
    },
    notifications: {
      smtpEnabled: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      emailNotifications: false,
      alertInactiveCustomers: true,
      inactiveCustomerDays: 30
    }
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'SUPERADMIN') {
      router.push('/admin/dashboard');
      return;
    }
    setUser(currentUser);
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    // En un proyecto real, cargarías las configuraciones desde el backend
    // const settings = await settingsService.getSettings();
    // setSettings(settings);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // En un proyecto real, enviarías las configuraciones al backend
      // await settingsService.updateSettings(settings);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al guardar configuraciones');
      }
    } finally {
      setLoading(false);
    }
  };

  function updateSetting<K extends keyof SystemSettings, F extends keyof SystemSettings[K]>(
    section: K,
    key: F,
    value: SystemSettings[K][F]
  ) {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'users', name: 'Usuarios', icon: Users },
    { id: 'customers', name: 'Clientes', icon: FileText },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'notifications', name: 'Notificaciones', icon: Bell }
  ];

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
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Settings className="h-8 w-8 mr-3 text-gray-600" />
                  Configuración del Sistema
                </h1>
                <p className="text-gray-600">Administrar configuraciones generales del sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {saved && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Guardado</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Cambios
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
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
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Configuración General</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre de la Aplicación</label>
                      <input
                        type="text"
                        value={settings.general.appName}
                        onChange={(e) => updateSetting('general', 'appName', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                      <input
                        type="text"
                        value={settings.general.companyName}
                        onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Zona Horaria</label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="America/Santo_Domingo">América/Santo Domingo</option>
                        <option value="America/New_York">América/Nueva York</option>
                        <option value="Europe/Madrid">Europa/Madrid</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Idioma</label>
                      <select
                        value={settings.general.language}
                        onChange={(e) => updateSetting('general', 'language', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                      <input
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* User Settings */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Configuración de Usuarios</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Longitud Mínima de Contraseña</label>
                      <input
                        type="number"
                        min="6"
                        max="20"
                        value={settings.users.passwordMinLength}
                        onChange={(e) => updateSetting('users', 'passwordMinLength', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tiempo de Sesión (horas)</label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={settings.users.sessionTimeout}
                        onChange={(e) => updateSetting('users', 'sessionTimeout', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Intentos Máximos de Login</label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={settings.users.maxLoginAttempts}
                        onChange={(e) => updateSetting('users', 'maxLoginAttempts', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.users.requireSpecialChars}
                        onChange={(e) => updateSetting('users', 'requireSpecialChars', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">Requerir caracteres especiales en contraseñas</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.users.allowRegistration}
                        onChange={(e) => updateSetting('users', 'allowRegistration', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">Permitir auto-registro de usuarios</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Settings */}
              {activeTab === 'customers' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Configuración de Clientes</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Máximo de Direcciones por Cliente</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.customers.maxAddresses}
                        onChange={(e) => updateSetting('customers', 'maxAddresses', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Campos Obligatorios</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['firstName', 'lastName', 'email', 'phone', 'documentNumber'].map(field => (
                        <div key={field} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.customers.requiredFields.includes(field)}
                            onChange={(e) => {
                              const current = settings.customers.requiredFields;
                              if (e.target.checked) {
                                updateSetting('customers', 'requiredFields', [...current, field]);
                              } else {
                                updateSetting('customers', 'requiredFields', current.filter(f => f !== field));
                              }
                            }}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label className="ml-3 text-sm text-gray-700 capitalize">
                            {field === 'firstName' ? 'Nombre' :
                             field === 'lastName' ? 'Apellido' :
                             field === 'email' ? 'Email' :
                             field === 'phone' ? 'Teléfono' :
                             field === 'documentNumber' ? 'Documento' : field}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.customers.enableEmailValidation}
                        onChange={(e) => updateSetting('customers', 'enableEmailValidation', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">Validar formato de email</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.customers.enablePhoneValidation}
                        onChange={(e) => updateSetting('customers', 'enablePhoneValidation', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">Validar formato de teléfono</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Configuración de Seguridad</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiración JWT (horas)</label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={settings.security.jwtExpirationHours}
                        onChange={(e) => updateSetting('security', 'jwtExpirationHours', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Orígenes CORS Permitidos</label>
                    <textarea
                      rows={3}
                      value={settings.security.corsOrigins.join('\n')}
                      onChange={(e) => updateSetting('security', 'corsOrigins', e.target.value.split('\n').filter(Boolean))}
                      placeholder="http://localhost:3000&#10;https://myapp.com"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Un origen por línea</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.enableAuditLogs}
                        onChange={(e) => updateSetting('security', 'enableAuditLogs', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">Habilitar logs de auditoría</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.enableBackup}
                        onChange={(e) => updateSetting('security', 'enableBackup', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">Habilitar backup automático</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.smtpEnabled}
                        onChange={(e) => updateSetting('notifications', 'smtpEnabled', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">Habilitar SMTP</label>
                    </div>
                  </div>
                  
                  {settings.notifications.smtpEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Servidor SMTP</label>
                        <input
                          type="text"
                          value={settings.notifications.smtpHost}
                          onChange={(e) => updateSetting('notifications', 'smtpHost', e.target.value)}
                          placeholder="smtp.gmail.com"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Puerto SMTP</label>
                        <input
                          type="number"
                          value={settings.notifications.smtpPort}
                          onChange={(e) => updateSetting('notifications', 'smtpPort', parseInt(e.target.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Usuario SMTP</label>
                        <input
                          type="email"
                          value={settings.notifications.smtpUser}
                          onChange={(e) => updateSetting('notifications', 'smtpUser', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">Habilitar notificaciones por email</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.alertInactiveCustomers}
                        onChange={(e) => updateSetting('notifications', 'alertInactiveCustomers', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">Alertar clientes inactivos</label>
                    </div>
                    
                    {settings.notifications.alertInactiveCustomers && (
                      <div className="ml-7">
                        <label className="block text-sm font-medium text-gray-700">Días para considerar inactivo</label>
                        <input
                          type="number"
                          min="7"
                          max="365"
                          value={settings.notifications.inactiveCustomerDays}
                          onChange={(e) => updateSetting('notifications', 'inactiveCustomerDays', parseInt(e.target.value))}
                          className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Info */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Información del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Versión:</span>
                <span className="ml-2 font-medium">1.0.0</span>
              </div>
              <div>
                <span className="text-gray-500">Base de Datos:</span>
                <span className="ml-2 font-medium">MySQL 8.0</span>
              </div>
              <div>
                <span className="text-gray-500">Último Backup:</span>
                <span className="ml-2 font-medium">{new Date().toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}