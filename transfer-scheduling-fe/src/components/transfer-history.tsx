import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchStatement } from "@/services/transferService";

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

export function TransferHistory() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        setLoading(true);
        const data = await fetchStatement();
        // Converte strings para Date
        const parsedData = data.map((t: any) => ({
          id: t.id,
          sourceAccount: t.originAccount,
          destinationAccount: t.destinationAccount,
          amount: t.transferValue,
          fee: t.appliedFee,
          totalAmount: t.totalValueWithFee,
          transferDate: new Date(t.transferDate),
          scheduledDate: new Date(t.schedulingDate),
        }));

        setTransfers(parsedData);
      } catch (err: any) {
        console.error(err);
        setError("Erro ao carregar extrato.");
      } finally {
        setLoading(false);
      }
    };

    loadTransfers();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);

  const formatAccount = (account: string) =>
    account.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.$3");

  if (loading) {
    return <div>Carregando extrato...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Extrato de Agendamentos</CardTitle>
          <CardDescription>
            Consulte todos os agendamentos de transferência realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum agendamento encontrado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Conta Origem</TableHead>
                    <TableHead>Conta Destino</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Taxa</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Data Transferência</TableHead>
                    <TableHead>Data Agendamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Badge variant="outline">#{t.id}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatAccount(t.sourceAccount)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatAccount(t.destinationAccount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(t.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(t.fee)}
                      </TableCell>
                      <TableCell className="text-right text-primary">
                        {formatCurrency(t.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {format(t.transferDate, "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {format(t.scheduledDate, "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {transfers.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Total de {transfers.length} agendamento
          {transfers.length !== 1 ? "s" : ""} encontrado
          {transfers.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
