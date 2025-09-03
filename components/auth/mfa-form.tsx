'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const mfaSchema = z.object({
  code: z
    .string()
    .min(1, 'Código é obrigatório')
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d+$/, 'Código deve conter apenas números'),
});

type MfaFormData = z.infer<typeof mfaSchema>;

interface MfaFormProps {
  sessionId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function MfaForm({ sessionId, onBack, onSuccess }: MfaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifyMfa } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<MfaFormData>({
    resolver: zodResolver(mfaSchema),
  });

  const code = watch('code', '');

  const onSubmit: SubmitHandler<MfaFormData> = async data => {
    setIsSubmitting(true);
    setError(null);

    try {
      await verifyMfa(data, sessionId);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Código inválido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Verificação em Duas Etapas
          </h1>
          <p className="mt-2 text-gray-600">
            Digite o código de 6 dígitos do seu aplicativo autenticador
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Código de Verificação
            </label>
            <input
              {...register('code')}
              type="text"
              maxLength={6}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-center font-mono text-2xl leading-5 tracking-widest placeholder-gray-500 focus:border-green-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:outline-none"
              placeholder="000000"
              disabled={isSubmitting}
              autoComplete="one-time-code"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Verificando...
                </div>
              ) : (
                'Verificar Código'
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não consegue acessar seu aplicativo autenticador?{' '}
            <a
              href="/help/mfa"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Obter ajuda
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
