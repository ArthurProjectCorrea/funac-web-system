'use client';

import React from 'react';
import { useAuth, withAuth, usePermissions } from '@/contexts/auth-context';
import {
  Shield,
  User,
  Settings,
  LogOut,
  Bell,
  Key,
  Smartphone,
  History,
} from 'lucide-react';

function DashboardPage() {
  const { user, logout, logoutAll } = useAuth();
  const { hasPermission, hasRole } = usePermissions();

  const handleLogout = async () => {
    await logout();
  };

  const handleLogoutAll = async () => {
    if (confirm('Deseja encerrar todas as sessões ativas?')) {
      await logoutAll();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="mr-3 h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                FUNAC Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="mr-2 h-4 w-4" />
                {user?.firstName} {user?.lastName}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Bem-vindo, {user?.firstName}!
            </h2>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Status do Email:
                </span>
                <p
                  className={`${user?.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}
                >
                  {user?.isEmailVerified ? 'Verificado' : 'Não verificado'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">MFA:</span>
                <p
                  className={`${user?.isMfaEnabled ? 'text-green-600' : 'text-yellow-600'}`}
                >
                  {user?.isMfaEnabled ? 'Ativado' : 'Desativado'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <button className="flex items-center rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md">
                <Settings className="mr-3 h-8 w-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Configurações</p>
                  <p className="text-sm text-gray-600">Gerenciar conta</p>
                </div>
              </button>

              <button className="flex items-center rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md">
                <Key className="mr-3 h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Alterar Senha</p>
                  <p className="text-sm text-gray-600">Segurança da conta</p>
                </div>
              </button>

              <button className="flex items-center rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md">
                <Smartphone className="mr-3 h-8 w-8 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Configurar MFA</p>
                  <p className="text-sm text-gray-600">Segurança adicional</p>
                </div>
              </button>

              <button className="flex items-center rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md">
                <History className="mr-3 h-8 w-8 text-orange-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Histórico</p>
                  <p className="text-sm text-gray-600">Atividades recentes</p>
                </div>
              </button>
            </div>
          </div>

          {/* User Roles and Permissions */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Suas Funções
              </h3>
              <div className="space-y-2">
                {user?.roles.map(role => (
                  <div
                    key={role.id}
                    className="flex items-center rounded bg-blue-50 p-2"
                  >
                    <span className="font-medium text-blue-800">
                      {role.name}
                    </span>
                    {role.description && (
                      <span className="ml-2 text-sm text-gray-600">
                        - {role.description}
                      </span>
                    )}
                  </div>
                ))}
                {!user?.roles.length && (
                  <p className="text-gray-500">Nenhuma função atribuída</p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Permissões
              </h3>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {user?.permissions.map(permission => (
                  <div
                    key={permission.id}
                    className="flex items-center rounded bg-gray-50 p-2 text-sm"
                  >
                    <span className="font-medium text-gray-700">
                      {permission.action}
                    </span>
                    <span className="mx-2 text-gray-400">em</span>
                    <span className="text-gray-600">{permission.resource}</span>
                  </div>
                ))}
                {!user?.permissions.length && (
                  <p className="text-gray-500">Nenhuma permissão específica</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Actions */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Segurança da Conta
            </h3>
            <div className="flex flex-wrap gap-4">
              {!user?.isEmailVerified && (
                <button className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700">
                  Verificar Email
                </button>
              )}

              {!user?.isMfaEnabled && (
                <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                  Ativar MFA
                </button>
              )}

              <button
                onClick={handleLogoutAll}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Encerrar Todas as Sessões
              </button>

              {/* Conditional admin actions */}
              {hasRole('admin') && (
                <button className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                  Painel Administrativo
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(DashboardPage);
