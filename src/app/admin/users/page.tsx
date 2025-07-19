'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, User } from '@/lib/auth';
import { customerService, Customer, PaginatedResponse, CreateCustomerRequest, Address } from '@/lib/customer-service';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  Phone,
  Mail,
  FileText,
  Save,
  X
} from 'lucide-react';

// Tipos para los formularios
interface AddressForm {
  type: 'HOME' | 'WORK' | 'OTHER';
  street: string;
  city: string;
  country: string;
  isPrimary: boolean;
}

interface CustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: 'CEDULA' | 'PASSPORT' | 'RNC';
  documentNumber: string;
  addresses: AddressForm[];
}

interface UpdateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: 'CEDULA' | 'PASSPORT' | 'RNC';
  documentNumber: string;
  addresses: Omit<Address, 'id' | 'active'>[];
}

export default function CustomersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<PaginatedResponse<Customer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados para formularios
  const [createForm, setCreateForm] = useState<CustomerForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: 'CEDULA',
    documentNumber: '',
    addresses: [{
      type: 'HOME',
      street: '',
      city: '',
      country: 'República Dominicana',
      isPrimary: true
    }]
  });

  const [editForm, setEditForm] = useState<CustomerForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: 'CEDULA',
    documentNumber: '',
    addresses: []
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    // Tanto ADMIN como SUPERADMIN pueden gestionar clientes
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Verificar si viene con parámetro de búsqueda
    if (searchParams.get('search') === 'true') {
      // Auto-focus en el campo de búsqueda
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (user) {
      loadCustomers();
    }
  }, [user, currentPage]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (isSearching && searchTerm.trim() !== '') {
        // Para búsqueda
        data = await customerService.searchCustomers(searchTerm.trim(), 0, 100);
        setCustomers(data);
      } else {
        // Paginación normal
        data = await customerService.getCustomers(currentPage, 20, 'createdAt');
        setCustomers(data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      // Si la búsqueda está vacía, resetear a paginación normal
      setIsSearching(false);
      setCurrentPage(0);
    } else {
      // Iniciar búsqueda
      setIsSearching(true);
      setCurrentPage(0);
    }
    await loadCustomers();
  };

  const handleClearSearch = async () => {
    setSearchTerm('');
    setIsSearching(false);
    setCurrentPage(0);
    await loadCustomers();
  };

  const handleDeactivate = async (customerId: number) => {
    if (!confirm('¿Está seguro que desea desactivar este cliente?')) return;
    
    try {
      await customerService.deactivateCustomer(customerId);
      await loadCustomers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    }
  };

  const handleActivate = async (customerId: number) => {
    try {
      await customerService.activateCustomer(customerId);
      await loadCustomers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    }
  };

  // Funciones para el formulario de creación
  const resetCreateForm = () => {
    setCreateForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      documentType: 'CEDULA',
      documentNumber: '',
      addresses: [{
        type: 'HOME',
        street: '',
        city: '',
        country: 'República Dominicana',
        isPrimary: true
      }]
    });
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      const createRequest: CreateCustomerRequest = {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        phone: createForm.phone,
        documentType: createForm.documentType,
        documentNumber: createForm.documentNumber,
        addresses: createForm.addresses.map(addr => ({
          type: addr.type,
          street: addr.street,
          city: addr.city,
          country: addr.country,
          isPrimary: addr.isPrimary
        }))
      };

      await customerService.createCustomer(createRequest);
      setShowCreateModal(false);
      resetCreateForm();
      await loadCustomers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const addCreateAddress = () => {
    setCreateForm(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        type: 'HOME',
        street: '',
        city: '',
        country: 'República Dominicana',
        isPrimary: false
      }]
    }));
  };

  const removeCreateAddress = (index: number) => {
    setCreateForm(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const updateCreateAddress = (index: number, field: keyof AddressForm, value: string | boolean) => {
    setCreateForm(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const setPrimaryCreateAddress = (index: number) => {
    setCreateForm(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => ({
        ...addr,
        isPrimary: i === index
      }))
    }));
  };

  // Funciones para el formulario de edición
  const initializeEditForm = (customer: Customer) => {
    setEditForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      documentType: customer.documentType,
      documentNumber: customer.documentNumber,
      addresses: customer.addresses.map(addr => ({
        type: addr.type,
        street: addr.street,
        city: addr.city,
        country: addr.country,
        isPrimary: addr.isPrimary
      }))
    });
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setFormLoading(true);
    setError(null);

    try {
      const updateRequest: UpdateCustomerRequest = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        documentType: editForm.documentType,
        documentNumber: editForm.documentNumber,
        addresses: editForm.addresses.map(addr => ({
          type: addr.type,
          street: addr.street,
          city: addr.city,
          country: addr.country,
          isPrimary: addr.isPrimary
        }))
      };

      // Nota: Necesitarás agregar este método al customerService
      // await customerService.updateCustomer(selectedCustomer.id, updateRequest);
      console.log('Update request:', updateRequest);
      
      setShowEditModal(false);
      setSelectedCustomer(null);
      await loadCustomers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const addEditAddress = () => {
    setEditForm(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        type: 'HOME',
        street: '',
        city: '',
        country: 'República Dominicana',
        isPrimary: false
      }]
    }));
  };

  const removeEditAddress = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const updateEditAddress = (index: number, field: keyof AddressForm, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const setPrimaryEditAddress = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => ({
        ...addr,
        isPrimary: i === index
      }))
    }));
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    initializeEditForm(customer);
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'CEDULA': return 'Cédula';
      case 'PASSPORT': return 'Pasaporte';
      case 'RNC': return 'RNC';
      default: return type;
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'HOME': return <Home className="h-4 w-4 text-green-600" />;
      case 'WORK': return <FileText className="h-4 w-4 text-blue-600" />;
      default: return <MapPin className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'HOME': return 'Casa';
      case 'WORK': return 'Trabajo';
      case 'OTHER': return 'Otro';
      default: return type;
    }
  };

  if (!user) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      </Suspense>

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
                <Users className="h-8 w-8 mr-3 text-green-600" />
                Gestión de Clientes
              </h1>
              <p className="text-gray-600">
                {user.role === 'SUPERADMIN' ? 'Todos los clientes del sistema' : 'Mis clientes administrados'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
          
          {/* Search and Actions */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="Buscar por nombre, email o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              {/* Search Status */}
              {isSearching && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Buscando: &quot;<strong>{searchTerm}</strong>&quot;
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                Buscar
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">
                  {isSearching ? 'Buscando clientes...' : 'Cargando clientes...'}
                </p>
              </div>
            ) : customers && customers.content.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Direcciones
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Creado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.content.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-green-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {customer.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <Mail className="h-4 w-4 mr-1 text-gray-400" />
                              {customer.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-4 w-4 mr-1 text-gray-400" />
                              {customer.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.documentNumber}</div>
                            <div className="text-sm text-gray-500">{getDocumentTypeLabel(customer.documentType)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                              {customer.addresses.length} dirección{customer.addresses.length !== 1 ? 'es' : ''}
                            </div>
                            {customer.addresses.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {customer.addresses.find(addr => addr.isPrimary)?.city || customer.addresses[0].city}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customer.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.active ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Activo
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inactivo
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(customer.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowDetailsModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => openEditModal(customer)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              
                              {customer.active ? (
                                <button
                                  onClick={() => handleDeactivate(customer.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Desactivar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivate(customer.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Activar"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination - Solo mostrar cuando no se está buscando */}
                {!isSearching && customers.totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={customers.first}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={customers.last}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Mostrando{' '}
                          <span className="font-medium">{customers.number * customers.size + 1}</span>
                          {' '}-{' '}
                          <span className="font-medium">
                            {Math.min((customers.number + 1) * customers.size, customers.totalElements)}
                          </span>
                          {' '}de{' '}
                          <span className="font-medium">{customers.totalElements}</span>
                          {' '}resultados
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={customers.first}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            Página {customers.number + 1} de {customers.totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={customers.last}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Results Info */}
                {isSearching && (
                  <div className="bg-blue-50 px-4 py-3 border-t border-blue-200">
                    <p className="text-sm text-blue-700">
                      {customers.content.length > 0 
                        ? `Se encontraron ${customers.content.length} cliente(s) que coinciden con "${searchTerm}"`
                        : `No se encontraron clientes que coincidan con "${searchTerm}"`
                      }
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {isSearching ? 'No se encontraron clientes' : 'No hay clientes'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isSearching 
                    ? `No se encontraron clientes que coincidan con "${searchTerm}".`
                    : 'Comience agregando un nuevo cliente al sistema.'
                  }
                </p>
                {!isSearching && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Cliente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-8 mx-auto p-0 border w-full max-w-4xl shadow-lg rounded-lg bg-white mb-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Plus className="h-6 w-6 mr-2 text-green-600" />
                Crear Nuevo Cliente
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomer} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h4 className="text-base font-medium text-gray-900">Información Personal</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={createForm.firstName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                    <input
                      type="text"
                      required
                      value={createForm.lastName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                    <input
                      type="tel"
                      required
                      value={createForm.phone}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de documento *</label>
                    <select
                      required
                      value={createForm.documentType}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, documentType: e.target.value as 'CEDULA' | 'PASSPORT' | 'RNC' }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="CEDULA">Cédula</option>
                      <option value="PASSPORT">Pasaporte</option>
                      <option value="RNC">RNC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número de documento *</label>
                    <input
                      type="text"
                      required
                      value={createForm.documentNumber}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, documentNumber: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Direcciones */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900">Direcciones</h4>
                    <button
                      type="button"
                      onClick={addCreateAddress}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {createForm.addresses.map((address, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <select
                              value={address.type}
                              onChange={(e) => updateCreateAddress(index, 'type', e.target.value)}
                              className="border border-gray-300 rounded text-sm py-1 px-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            >
                              <option value="HOME">Casa</option>
                              <option value="WORK">Trabajo</option>
                              <option value="OTHER">Otro</option>
                            </select>
                            
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="primaryAddress"
                                checked={address.isPrimary}
                                onChange={() => setPrimaryCreateAddress(index)}
                                className="text-green-600"
                              />
                              <span className="ml-2 text-sm text-gray-700">Principal</span>
                            </label>
                          </div>
                          
                          {createForm.addresses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCreateAddress(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Dirección completa *"
                            required
                            value={address.street}
                            onChange={(e) => updateCreateAddress(index, 'street', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Ciudad *"
                            required
                            value={address.city}
                            onChange={(e) => updateCreateAddress(index, 'city', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                          <input
                            type="text"
                            placeholder="País *"
                            required
                            value={address.country}
                            onChange={(e) => updateCreateAddress(index, 'country', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Cliente
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-8 mx-auto p-0 border w-full max-w-4xl shadow-lg rounded-lg bg-white mb-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Edit className="h-6 w-6 mr-2 text-yellow-600" />
                Editar Cliente: {selectedCustomer.fullName}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCustomer(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditCustomer} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h4 className="text-base font-medium text-gray-900">Información Personal</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                    <input
                      type="text"
                      required
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                    <input
                      type="tel"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de documento *</label>
                    <select
                      required
                      value={editForm.documentType}
                      onChange={(e) => setEditForm(prev => ({ ...prev, documentType: e.target.value as 'CEDULA' | 'PASSPORT' | 'RNC' }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="CEDULA">Cédula</option>
                      <option value="PASSPORT">Pasaporte</option>
                      <option value="RNC">RNC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número de documento *</label>
                    <input
                      type="text"
                      required
                      value={editForm.documentNumber}
                      onChange={(e) => setEditForm(prev => ({ ...prev, documentNumber: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Direcciones */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900">Direcciones</h4>
                    <button
                      type="button"
                      onClick={addEditAddress}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {editForm.addresses.map((address, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <select
                              value={address.type}
                              onChange={(e) => updateEditAddress(index, 'type', e.target.value)}
                              className="border border-gray-300 rounded text-sm py-1 px-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            >
                              <option value="HOME">Casa</option>
                              <option value="WORK">Trabajo</option>
                              <option value="OTHER">Otro</option>
                            </select>
                            
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="primaryEditAddress"
                                checked={address.isPrimary}
                                onChange={() => setPrimaryEditAddress(index)}
                                className="text-green-600"
                              />
                              <span className="ml-2 text-sm text-gray-700">Principal</span>
                            </label>
                          </div>
                          
                          {editForm.addresses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEditAddress(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Dirección completa *"
                            required
                            value={address.street}
                            onChange={(e) => updateEditAddress(index, 'street', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Ciudad *"
                            required
                            value={address.city}
                            onChange={(e) => updateEditAddress(index, 'city', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                          <input
                            type="text"
                            placeholder="País *"
                            required
                            value={address.country}
                            onChange={(e) => updateEditAddress(index, 'country', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCustomer(null);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-8 mx-auto p-0 border w-full max-w-3xl shadow-lg rounded-lg bg-white mb-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-green-600" />
                Detalles del Cliente
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-4">Información Personal</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                      <dd className="text-sm text-gray-900">{selectedCustomer.fullName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {selectedCustomer.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                      <dd className="text-sm text-gray-900 flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {selectedCustomer.phone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Documento</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedCustomer.documentNumber} ({getDocumentTypeLabel(selectedCustomer.documentType)})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado</dt>
                      <dd>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedCustomer.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedCustomer.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Creado</dt>
                      <dd className="text-sm text-gray-900">{formatDate(selectedCustomer.createdAt)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Direcciones */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-4">
                    Direcciones ({selectedCustomer.addresses.length})
                  </h4>
                  <div className="space-y-4">
                    {selectedCustomer.addresses.map((address, index) => (
                      <div key={address.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            {getAddressTypeIcon(address.type)}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {getAddressTypeLabel(address.type)}
                            </span>
                            {address.isPrimary && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                Principal
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-start">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0" />
                            {address.street}
                          </p>
                          <p className="ml-5 text-gray-500">
                            {address.city}, {address.country}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  openEditModal(selectedCustomer);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}