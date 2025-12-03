"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Session, Report, AppView, FormData, HumanDesignChart, UserProfile } from '@/lib/types';
import { calculateHumanDesignChart, generateReport, saveReport } from '@/lib/services/geminiService';
import HumanDesignForm from '@/app/components/HumanDesignForm';
import ReportDisplay from '@/app/components/ReportDisplay';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import AuthPage from '@/app/components/AuthPage';
import { HeaderIcon, PlusIcon, LockIcon } from '@/app/components/icons';
import RoomsButton from '@/app/components/RoomsButton';
import MagickalBackLink from '@/app/components/MagickalBackLink';

export default function HumanDesignPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [view, setView] = useState<AppView>({ type: 'dashboard' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const canGenerateReport = reports.length === 0;

  const fetchProfileAndData = useCallback(async (user: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id);
      if (reportsError) throw reportsError;
      setReports(reportsData || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Could not fetch your account data.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchProfileAndData(session.user);
      } else {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfileAndData(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfileAndData]);

  const handleFormSubmit = async (formData: FormData) => {
    if (!session) return;
    if (!canGenerateReport) {
      setError("You have already generated your free report.");
      return;
    }
    setLoading(true);
    setError(null);
    setView({ type: 'dashboard' });
    try {
      setLoadingMessage("Calculating your unique Human Design chart...");
      const chartData: HumanDesignChart = await calculateHumanDesignChart(formData);
      
      setLoadingMessage("Interpreting your blueprint and writing your report...");
      const reportContent = await generateReport(chartData, formData.name);

      setLoadingMessage("Saving your report to your account...");
      const newReport = await saveReport(session.user.id, formData.name, chartData, reportContent);

      await fetchProfileAndData(session.user);
      setView({ type: 'view_report', report: newReport });

    } catch (err) {
      setError('Failed to generate the report. The cosmic energies might be busy. Please try again.');
      setView({ type: 'dashboard' });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const renderContent = () => {
    if (loading && !loadingMessage) return <LoadingSpinner customMessage={'Loading your dashboard...'} />;
    if (loading && loadingMessage) return <LoadingSpinner customMessage={loadingMessage} />;
    if (error) return <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">{error}</div>;

    switch (view.type) {
      case 'generate':
        return <HumanDesignForm onSubmit={handleFormSubmit} isLoading={loading} />;
      case 'view_report':
        return (
          <div>
            <button onClick={() => setView({type: 'dashboard'})} className="mb-4 text-purple-400 hover:text-purple-300 transition-colors">&larr; Back to Dashboard</button>
            <ReportDisplay reportContent={view.report.report_content} />
          </div>
        );
      case 'dashboard':
        return (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <div key={report.id} onClick={() => setView({ type: 'view_report', report })} className="bg-white/10 p-6 rounded-lg cursor-pointer hover:bg-white/20 transition-all transform hover:scale-105">
                <h3 className="text-xl font-bold text-purple-300 font-serif">{report.name}'s Report</h3>
                <p className="text-gray-400 text-sm">Human Design Blueprint</p>
                <p className="text-xs text-gray-500 mt-2">Created: {new Date(report.created_at).toLocaleDateString()}</p>
              </div>
            ))}
            {canGenerateReport ? (
               <div onClick={() => setView({ type: 'generate' })} className="border-2 border-dashed border-purple-400/50 p-6 rounded-lg cursor-pointer hover:bg-purple-900/20 transition-colors flex flex-col items-center justify-center text-center min-h-[170px] text-purple-300">
                <PlusIcon />
                <h3 className="text-xl font-bold mt-2 font-serif">Generate New Report</h3>
                <p className="text-purple-400 text-sm">Your first full report is free!</p>
              </div>
            ) : (
                 <div className="border-2 border-dashed border-white/20 p-6 rounded-lg flex flex-col items-center justify-center text-center min-h-[170px] bg-black/20 relative cursor-not-allowed">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                        <LockIcon className="w-6 h-6 text-yellow-400" />
                        <h3 className="text-xl font-bold mt-2 font-serif">Report Limit Reached</h3>
                        <p className="text-gray-400 text-sm">Log in to your Spell Room account to subscribe.</p>
                    </div>
                </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <main 
      className="relative min-h-screen w-full bg-black bg-cover bg-center"
      style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        
        {/* UPDATED HEADER */}
        <header className="mb-8 w-full shrink-0">
            <div className="flex justify-between items-center flex-wrap w-full">
                <div className="order-1">
                    <MagickalBackLink href="/oracle-room" text="Oracle Room" />
                </div>
                <div className="order-2 md:order-3">
                    <RoomsButton />
                </div>
                <div className="w-full text-center order-3 md:w-auto md:order-2 mt-2 md:mt-0 flex justify-center items-center gap-4">
                    <HeaderIcon />
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-red-500">
                      Human Design
                    </h1>
                </div>
            </div>
            <p className="text-lg text-gray-400 mt-2 text-center">Unlock the blueprint of your soul. Generate your chart to understand your unique energetic mechanics.</p>
        </header>

        <main className="bg-black/40 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl shadow-purple-500/10 border border-white/10 transition-all duration-300">
          {loading ? <LoadingSpinner customMessage="Initializing session..." /> : !session ? <AuthPage /> : renderContent()}
        </main>
      </div>
    </main>
  );
}