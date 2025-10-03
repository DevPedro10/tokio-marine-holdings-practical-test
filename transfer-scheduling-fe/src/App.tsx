import { useState } from "react";
import "./index.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Building2, Calendar, History } from "lucide-react";
import { TransferScheduler } from "./components/transfer-scheduler";
import { TransferHistory } from "./components/transfer-history";
import { toast } from "sonner";

interface Transfer {
  id: number;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  fee: number;
  totalAmount: number;
  transferDate: Date;
  scheduledDate: Date;
}

export default function App() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [activeTab, setActiveTab] = useState("schedule");

  const handleScheduleTransfer = (transfer: Transfer) => {
    setTransfers((prev) => [...prev, transfer]);
    toast.success("Transferência agendada com sucesso!", {
      description: `Agendamento #${
        transfer.id
      } criado para ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(transfer.totalAmount)}`,
    });
    setActiveTab("history");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-primary">TransferScheduling</h1>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gerencie suas transações financeiras com segurança e conformidade.
            Calcule taxas de agendamento em tempo real e acesse o histórico
            operacional completo.
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="schedule" className="flex items-center gap-3">
              <Calendar className="h-4 w-4" />
              Agendar nova transação
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-3">
              <History className="h-4 w-4" />
              Histórico de Transações
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="schedule" className="space-y-6">
              <TransferScheduler onScheduleTransfer={handleScheduleTransfer} />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <TransferHistory transfers={transfers} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Projeto de Avaliação Prática • Tokio Marine</p>
          <p className="mt-1">Sistema de Agendamento de Transferências</p>
        </div>
      </div>
    </div>
  );
}
