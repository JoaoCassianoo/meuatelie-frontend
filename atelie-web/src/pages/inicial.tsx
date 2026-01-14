import { useEffect, useState } from 'react';
import { obterResumoAnual, obterResumoMensal } from '../api/financeiro.api';
import { ResumoCard } from '../components/financeiro/ResumoMensal';

export default function Inicial() {
    const [resumoAnual, setResumoAnual] = useState<any>(null);
    const [resumoMensal, setResumoMensal] = useState<any>(null);
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;
    const mesNome = new Date().toLocaleString('pt-BR', { month: 'long' }).toLocaleUpperCase();

    useEffect(() => {
        obterResumoAnual(anoAtual).then(setResumoAnual); 
        obterResumoMensal(anoAtual, mesAtual).then(setResumoMensal);
    }, []);

    return (
    <div className='p-6'>
            <h1 className='text-2xl font-bold mb-4'>Dashboard Inicial</h1>

            <div className='flex gap-10'>
                <div className='w-full'>
                    <div className='flex gap-2'><h1>Movimento Financeiro Anual de </h1> <h1 className='text-sky-500'>{anoAtual}</h1></div>
                    <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                        <ResumoCard titulo="Entradas" valor={resumoAnual ? resumoAnual.totalEntradas : 0} />
                        <ResumoCard titulo="Saídas" valor={resumoAnual ? resumoAnual.totalSaidas : 0} />
                        <ResumoCard titulo="Loja" valor={resumoAnual ? resumoAnual.totalLoja : 0} />
                        <ResumoCard titulo="Pessoal" valor={resumoAnual ? resumoAnual.totalPessoal : 0} />
                        <ResumoCard titulo="Débito" valor={resumoAnual ? resumoAnual.totalDebito : 0} />
                        <ResumoCard titulo="Crédito" valor={resumoAnual ? resumoAnual.totalCredito : 0} />
                    </div>
                </div>
                <div className='w-full'>
                    <div className='flex gap-2'><h1>Movimento Financeiro Mensal de</h1> <h1 className='text-sky-500'>{mesNome}</h1></div>
                    <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                        <ResumoCard titulo="Entradas" valor={resumoMensal ? resumoMensal.totalEntradas : 0} />
                        <ResumoCard titulo="Saídas" valor={resumoMensal ? resumoMensal.totalSaidas : 0} />
                        <ResumoCard titulo="Loja" valor={resumoMensal ? resumoMensal.totalLoja : 0} />
                        <ResumoCard titulo="Pessoal" valor={resumoMensal ? resumoMensal.totalPessoal : 0} />
                        <ResumoCard titulo="Débito" valor={resumoMensal ? resumoMensal.totalDebito : 0} />
                        <ResumoCard titulo="Crédito" valor={resumoMensal ? resumoMensal.totalCredito : 0} />
                    </div>
                </div>
            </  div>
        </div>
    );
}