import { useEffect, useState } from 'react';
import { obterResumoAnual, obterResumoMensal } from '../api/financeiro.api';
import { ResumoCard } from '../components/financeiro/ResumoMensal';
import { PageHeader } from '../components/PageHeader';
import { BarChart3, Package, CheckSquare, ShoppingCart, Truck, TrendingUp, TrendingDown } from 'lucide-react';

export default function Inicial({setActivePage}: {setActivePage?: (page: string) => void}) {
    const [resumoAnual, setResumoAnual] = useState<any>(null);
    const [resumoMensal, setResumoMensal] = useState<any>(null);
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;
    const mesNome = new Date().toLocaleString('pt-BR', { month: 'long' }).toLocaleUpperCase();

    useEffect(() => {
        obterResumoAnual(anoAtual).then(setResumoAnual); 
        obterResumoMensal(anoAtual, mesAtual).then(setResumoMensal);
    }, []);

    // Calculate balance
    const saldoAnual = (resumoAnual?.totalEntradas || 0) + (resumoAnual?.totalSaidas || 0);
    const saldoMensal = (resumoMensal?.totalEntradas || 0) + (resumoMensal?.totalSaidas || 0);

    const modules = [
        { id: 'financeiro', label: 'Financeiro', icon: BarChart3, color: 'bg-blue-500', desc: 'Gestão financeira' },
        { id: 'estoque', label: 'Estoque', icon: Package, color: 'bg-green-500', desc: 'Controle de produtos' },
        { id: 'todo', label: 'To-do List', icon: CheckSquare, color: 'bg-purple-500', desc: 'Tarefas e lembretes' },
        { id: 'vendas', label: 'Vendas', icon: ShoppingCart, color: 'bg-orange-500', desc: 'Registro de vendas' },
        { id: 'encomendas', label: 'Encomendas', icon: Truck, color: 'bg-red-500', desc: 'Encomendas e pedidos' },
    ];

    return (
        <div className='p-6 lg:p-8'>
            <PageHeader title="Dashboard" />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Saldo Anual</p>
                            <p className={`text-2xl font-bold ${saldoAnual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {saldoAnual.toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                        {saldoAnual >= 0 ? (
                            <TrendingUp size={32} className="text-green-500" />
                        ) : (
                            <TrendingDown size={32} className="text-red-500" />
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <p className="text-gray-600 text-sm">Entradas (mês)</p>
                    <p className="text-2xl font-bold text-green-600">
                        R$ {(resumoMensal?.totalEntradas || 0).toFixed(2).replace('.', ',')}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
                    <p className="text-gray-600 text-sm">Saídas (mês)</p>
                    <p className="text-2xl font-bold text-red-600">
                        R$ {(resumoMensal?.totalSaidas || 0).toFixed(2).replace('.', ',')}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Saldo Mensal</p>
                            <p className={`text-2xl font-bold ${saldoMensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {saldoMensal.toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                        {saldoMensal >= 0 ? (
                            <TrendingUp size={32} className="text-green-500" />
                        ) : (
                            <TrendingDown size={32} className="text-red-500" />
                        )}
                    </div>
                </div>
            </div>

            {/* Modules Overview */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Módulos Disponíveis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {modules.map((module) => {
                        const Icon = module.icon;
                        return (
                            <div
                                key={module.id}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 text-center cursor-pointer group"
                                onClick={() => setActivePage && setActivePage(module.id.toString())}
                                
                            >
                                <div className={`${module.color} w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon size={28} className="text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{module.label}</h3>
                                <p className="text-xs text-gray-500">{module.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Financial Overview */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Annual Summary */}
                <div className='bg-white rounded-lg shadow-lg p-6'>
                    <div className='flex items-center gap-2 mb-4'>
                        <BarChart3 size={24} className="text-blue-600" />
                        <h2 className='text-xl font-bold'>Movimento Anual</h2>
                        <span className='text-blue-600 font-semibold'>{anoAtual}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <ResumoCard titulo="Entradas" valor={resumoAnual ? resumoAnual.totalEntradas : 0} />
                        <ResumoCard titulo="Saídas" valor={resumoAnual ? resumoAnual.totalSaidas : 0} />
                        <ResumoCard titulo="Loja" valor={resumoAnual ? resumoAnual.totalLoja : 0} />
                        <ResumoCard titulo="Pessoal" valor={resumoAnual ? resumoAnual.totalPessoal : 0} />
                        <ResumoCard titulo="Débito" valor={resumoAnual ? resumoAnual.totalDebito : 0} />
                        <ResumoCard titulo="Crédito" valor={resumoAnual ? resumoAnual.totalCredito : 0} />
                    </div>
                </div>

                {/* Monthly Summary */}
                <div className='bg-white rounded-lg shadow-lg p-6'>
                    <div className='flex items-center gap-2 mb-4'>
                        <BarChart3 size={24} className="text-green-600" />
                        <h2 className='text-xl font-bold'>Movimento Mensal</h2>
                        <span className='text-green-600 font-semibold'>{mesNome}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <ResumoCard titulo="Entradas" valor={resumoMensal ? resumoMensal.totalEntradas : 0} />
                        <ResumoCard titulo="Saídas" valor={resumoMensal ? resumoMensal.totalSaidas : 0} />
                        <ResumoCard titulo="Loja" valor={resumoMensal ? resumoMensal.totalLoja : 0} />
                        <ResumoCard titulo="Pessoal" valor={resumoMensal ? resumoMensal.totalPessoal : 0} />
                        <ResumoCard titulo="Débito" valor={resumoMensal ? resumoMensal.totalDebito : 0} />
                        <ResumoCard titulo="Crédito" valor={resumoMensal ? resumoMensal.totalCredito : 0} />
                    </div>
                </div>
            </div>
        </div>
    );
}