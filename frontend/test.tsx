/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import { useAuth } from '@/app/_context/authContext';
import ProfileSection from '@/app/components/profile/profile-section';
import ProcessSection from '@/app/components/profile/process-section';
import ResponsesSection from '@/app/components/profile/responses';
import SupportButton from '@/app/components/profile/support-button';
import { BiX } from 'react-icons/bi';
import Button from '@/app/components/Button';
import config from '@/app/config/config';
import { useProcesso } from '@/app/hooks/profile/use-process';
import { useCandidate } from '@/app/hooks/profile/use-candidate';
import DocumentsSectionAndVideos from '@/app/components/profile/second-stage/document';

const ProfileDashboard = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const { processo, processoLoading } = useProcesso();
  const { candidate } = useCandidate();
  const [activeTab, setActiveTab] = useState('process');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [user, token]);

  const statusLabels: Record<string, string> = {
    vai_prosseguir: 'Meu Recurso',
    em_recurso: 'Meu Recurso',
    em_revisao: 'Meu Recurso',
    correcao_ortografica: 'Meu Recurso',
    candidato_desistiu: 'Recurso Interrompido',
    pediu_reembolso: 'Pediu Reembolso',
    finalizado: 'Meu Recurso',
    entregue: 'Meu Recurso',
  };

  const getProcessTabTitle = () => {
    if (!processo) return 'Aguardando Inicio da Analise Prévia';
    return (
      statusLabels[processo.status_processo] ||
      'Aguardando Inicio da Analise Prévia'
    );
  };

  const shouldShowPlansTab = () => {
    if (!processo) return false;
    return processo.status_processo === 'esperando_resposta_candidato';
  };

  const shouldShowResponsesTab = () => {
    if (!processo) return false;
    return ['entregue'].includes(processo.status_processo);
  };

  useEffect(() => {
    if (processo) {
      console.log('Processo status:', processo.status_processo);
      console.log('Should show plans tab:', shouldShowPlansTab());
    }
    if (candidate) {
      console.log(
        'Candidate status_primeira_fase:',
        candidate.status_primeira_fase
      );
      console.log(
        'Should hide tabs based on first stage:',
        shouldHideTabsBasedOnFirstStage()
      );
    }
  }, [processo, candidate]);

  const shouldHideTabsBasedOnFirstStage = () => {
    if (
      processo &&
      processo.status_processo === 'esperando_resposta_candidato'
    ) {
      return false;
    }

    if (!candidate) return true;
    return [
      'aguardando_resultado_analise_previa',
      'aguardando_dados',
      'analise_previa',
    ].includes(candidate.status_primeira_fase);
  };

  useEffect(() => {
    if (
      (!shouldShowPlansTab() && activeTab === 'plans') ||
      (!shouldShowResponsesTab() && activeTab === 'respostas')
    ) {
      setActiveTab('process');
    }
  }, [processo?.status_processo, candidate?.status_primeira_fase]);

  const handleLogin = () => {
    router.push('/first-stage/register-candidato');
  };

  const handleWhatsAppSupport = () => {
    if (!config.SUPPORT_NUMBER) {
      throw new Error(
        'Número de suporte não está definido nas variáveis de ambiente.'
      );
    }
    const phoneNumber = config.SUPPORT_NUMBER;
    console.log(config.SUPPORT_NUMBER);

    const message = 'Olá, preciso de suporte.';
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
    setShowSupportModal(false);
  };

  const AuthModal = () => {
    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
          <button
            onClick={() => router.push('/')}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <BiX size={20} />
          </button>

          <div className="text-center mb-6">
            <div className="bg-red-100 text-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H9a3 3 0 00-3 3v4m9 0h6m-6 0H9"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Acesso Restrito
            </h2>
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para acessar a área do candidato. Por
              favor, faça login para continuar.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md"
            >
              Fazer Login
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-md"
            >
              Voltar para a Página Inicial
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (!user || !token) {
    return (
      <>
        <Header />
      </>
    );
  }

  if (processoLoading) {
    return (
      <>
        <Header />
        <main className="px-5 pt-2 pb-10 max-w-[1200px] mx-auto">
          <h1 className="text-4xl font-bold text-center mt-6">
            Área do Candidato
          </h1>
          <div className="flex justify-center mt-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Carregando informações do processo...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="px-5 pt-2 pb-10 max-w-[1200px] mx-auto">
        <h1 className="text-4xl font-bold text-center mt-6">
          Área do Candidato
        </h1>

        <div className="flex justify-center mt-6 mb-8 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 text-lg whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-500'
            }`}
          >
            Meu Perfil
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 text-lg whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-500'
            }`}
          >
            Meus Documentos
          </button>

          <button
            onClick={() => setActiveTab('process')}
            className={`px-6 py-3 text-lg whitespace-nowrap ${
              activeTab === 'process'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-500'
            }`}
          >
            {getProcessTabTitle()}
          </button>

          {shouldShowResponsesTab() && !shouldHideTabsBasedOnFirstStage() && (
            <button
              onClick={() => setActiveTab('respostas')}
              className={`px-6 py-3 text-lg whitespace-nowrap ${
                activeTab === 'respostas'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-500'
              }`}
            >
              Argumentação
            </button>
          )}
        </div>

        {activeTab === 'profile' && <ProfileSection />}
        {activeTab === 'summary' && <DocumentsSectionAndVideos />}
        {activeTab === 'process' && <ProcessSection />}
        {activeTab === 'respostas' && <ResponsesSection />}
        {/* {activeTab === "plans" && <PlansSection />} */}

        <SupportButton
          showSupportModal={showSupportModal}
          setShowSupportModal={setShowSupportModal}
          handleWhatsAppSupport={handleWhatsAppSupport}
        />
      </main>
    </>
  );
};

export default ProfileDashboard;
