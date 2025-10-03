import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Alert, AlertDescription } from "./ui/alert";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  scheduleTransfer,
  type TransferDTO,
  type TransferResponse,
} from "@/services/transferService";

interface TransferData {
  sourceAccount: string;
  destinationAccount: string;
  amount: string; // exibido no input
  amountNumber: number; // valor real numérico
  transferDate: Date | undefined;
}

interface CalculationResult {
  fee: number;
  totalAmount: number;
}

interface TransferSchedulerProps {
  onScheduleTransfer: (transfer: any) => void;
}

export function TransferScheduler({
  onScheduleTransfer,
}: TransferSchedulerProps) {
  const [formData, setFormData] = useState<TransferData>({
    sourceAccount: "",
    destinationAccount: "",
    amount: "",
    amountNumber: 0,
    transferDate: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [businessError, setBusinessError] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Simula cálculo de taxa baseado na data
  const calculateFee = (amount: number, date: Date): CalculationResult => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // zera hora para cálculo correto
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let fee = 0;

    if (diffDays === 0) {
      // Hoje → R$ 3,00 + 2,5%
      fee = 3 + amount * 0.025;
    } else if (diffDays >= 1 && diffDays <= 10) {
      // 1 a 10 dias → R$ 12 fixo
      fee = 12;
    } else if (diffDays >= 11 && diffDays <= 20) {
      // 11 a 20 dias → 8,2%
      fee = amount * 0.082;
    } else if (diffDays >= 21 && diffDays <= 30) {
      // 21 a 30 dias → 6,9%
      fee = amount * 0.069;
    } else if (diffDays >= 31 && diffDays <= 40) {
      // 31 a 40 dias → 4,7%
      fee = amount * 0.047;
    } else if (diffDays >= 41 && diffDays <= 50) {
      fee = amount * 0.017;
    } else {
      throw new Error(
        "Transferências não podem ser agendadas para mais de 50 dias no futuro"
      );
    }

    const totalAmount = amount + fee;

    return { fee, totalAmount };
  };

  const getCalculation = (): CalculationResult | null => {
    if (!formData.amountNumber || !formData.transferDate) {
      return null;
    }
    try {
      return calculateFee(formData.amountNumber, formData.transferDate);
    } catch {
      return null;
    }
  };

  const formatCurrencyFromNumber = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const parseCurrencyToNumber = (value: string): number => {
    const numbers = value.replace(/\D/g, ""); // só dígitos
    return parseFloat(numbers) / 100; // divide por 100 para virar reais
  };

  const handleAmountChange = (value: string) => {
    const numberValue = parseCurrencyToNumber(value);
    const formatted = formatCurrencyFromNumber(numberValue);
    setFormData((prev) => ({
      ...prev,
      amount: formatted,
      amountNumber: numberValue,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sourceAccount) {
      newErrors.sourceAccount = "Conta de origem é obrigatória";
    } else if (!/^\d{10}$/.test(formData.sourceAccount)) {
      newErrors.sourceAccount = "Conta de origem deve ter 10 dígitos";
    }

    if (!formData.destinationAccount) {
      newErrors.destinationAccount = "Conta de destino é obrigatória";
    } else if (!/^\d{10}$/.test(formData.destinationAccount)) {
      newErrors.destinationAccount = "Conta de destinodeve ter 10 dígitos";
    }

    if (!formData.amount) {
      newErrors.amount = "Valor é obrigatório";
    } else {
      const amount = parseFloat(
        formData.amount.replace(/[^\d.,]/g, "").replace(",", ".")
      );
      if (amount <= 0) {
        newErrors.amount = "Valor deve ser maior que zero";
      }
    }

    if (!formData.transferDate) {
      newErrors.transferDate = "Data de transferência é obrigatória";
    } else if (formData.transferDate < new Date()) {
      newErrors.transferDate = "Data não pode ser no passado";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusinessError("");

    if (!validateForm()) return;

    try {
      //   calculateFee(formData.amountNumber, formData.transferDate!);

      // Prepara DTO para enviar ao backend
      const transferDTO: TransferDTO = {
        originAccount: formData.sourceAccount,
        destinationAccount: formData.destinationAccount,
        value: formData.amountNumber,
        transferDate: formData.transferDate!.toISOString().split("T")[0],
      };

      // Chama service
      const savedTransfer: TransferResponse = await scheduleTransfer(
        transferDTO
      );

      // Retorna para o parent se necessário
      onScheduleTransfer(savedTransfer);

      // Reset do formulário
      setFormData({
        sourceAccount: "",
        destinationAccount: "",
        amount: "",
        amountNumber: 0,
        transferDate: undefined,
      });
    } catch (error) {
      setBusinessError((error as Error).message);
    }
  };

  const calculation = getCalculation();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {businessError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{businessError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros da Transação</CardTitle>
          <CardDescription className="my-2">
            Insira os dados para configurar a transferência. <br />
            As regras de tarifa serão aplicadas automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceAccount">Conta de Origem</Label>
                <Input
                  id="sourceAccount"
                  type="text"
                  placeholder="0000000000"
                  value={formData.sourceAccount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData((prev) => ({
                        ...prev,
                        sourceAccount: value,
                      }));
                      setErrors((prev) => ({ ...prev, sourceAccount: "" }));
                    }
                  }}
                  className={errors.sourceAccount ? "border-destructive" : ""}
                />
                {errors.sourceAccount && (
                  <p className="text-sm text-destructive">
                    {errors.sourceAccount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationAccount">Conta de Destino</Label>
                <Input
                  id="destinationAccount"
                  type="text"
                  placeholder="0000000000"
                  value={formData.destinationAccount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData((prev) => ({
                        ...prev,
                        destinationAccount: value,
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        destinationAccount: "",
                      }));
                    }
                  }}
                  className={
                    errors.destinationAccount ? "border-destructive" : ""
                  }
                />
                {errors.destinationAccount && (
                  <p className="text-sm text-destructive">
                    {errors.destinationAccount}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor da Transferência</Label>
              <Input
                id="amount"
                type="text"
                placeholder="R$ 0,00"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={errors.amount ? "border-destructive" : ""}
              />

              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Data da Transferência</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left ${
                      errors.transferDate ? "border-destructive" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.transferDate ? (
                      format(formData.transferDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.transferDate}
                    onSelect={(date) => {
                      setFormData((prev) => ({ ...prev, transferDate: date }));
                      setErrors((prev) => ({ ...prev, transferDate: "" }));
                      setBusinessError("");
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // garante que hoje seja permitido
                      return date < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.transferDate && (
                <p className="text-sm text-destructive">
                  {errors.transferDate}
                </p>
              )}
            </div>

            {calculation && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Resumo da Transferência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Valor da Transferência:</span>
                    <span>
                      {formatCurrencyFromNumber(formData.amountNumber)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa Aplicada:</span>
                    <span>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(calculation.fee)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Valor Total a Ser Debitado:</span>
                    <span className="text-primary">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(calculation.totalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full">
              Confirmar Agendamento
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
