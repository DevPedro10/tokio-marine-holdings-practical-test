const BASE_URL = "http://localhost:8080/api/schedules";

/**
 * DTO para agendamento de transferência.
 */
export interface TransferDTO {
  originAccount: string; // 10 dígitos
  destinationAccount: string; // 10 dígitos
  value: number; // positivo
  transferDate: string; // formato ISO: YYYY-MM-DD
}

/**
 * Retorno esperado ao agendar transferência
 */
export interface TransferResponse {
  id: number;
  originAccount: string;
  destinationAccount: string;
  value: number;
  transferDate: string;
  createdAt: string;
}

/**
 * Envia uma requisição POST para agendar uma nova transferência.
 */
export const scheduleTransfer = async (
  transferData: TransferDTO
): Promise<TransferResponse> => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transferData),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && response.status === 201) {
      return data;
    }

    if (response.status === 400) {
      // Backend pode enviar um objeto { error: "...", details: [...] }
      const message = data?.error || "Erro de validação ou regra de negócio.";
      throw new Error(message);
    }

    throw new Error(`Erro desconhecido: Status ${response.status}`);
  } catch (error) {
    console.error("Erro ao agendar transferência:", error);
    throw error;
  }
};

/**
 * Busca o extrato de transferências.
 */
export const fetchStatement = async (): Promise<TransferResponse[]> => {
  try {
    const response = await fetch(BASE_URL, { method: "GET" });
    const data = await response.json().catch(() => null);

    if (response.ok) return data;

    throw new Error(`Falha ao carregar extrato: Status ${response.status}`);
  } catch (error) {
    console.error("Erro ao carregar extrato:", error);
    throw error;
  }
};
