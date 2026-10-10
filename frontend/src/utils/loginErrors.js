/** Friendly login diagnostics without revealing whether an account exists. */
export function getLoginErrorMessage(error) {
  const status = error?.response?.status;
  if (status === 401 || status === 400) {
    return "Usuário ou senha inválidos. Confira os dados e tente novamente.";
  }
  if (status === 429) {
    return "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.";
  }
  if (status === 403) {
    return "A solicitação foi bloqueada por segurança. Atualize a página e tente novamente.";
  }
  if (status >= 500) {
    return "A API está com problemas no momento. Tente novamente mais tarde.";
  }
  if (!error?.response) {
    return "Não foi possível conectar à API. Verifique se o servidor está ativo e se VITE_API_URL aponta para a API correta.";
  }
  return "Não foi possível concluir o acesso. Tente novamente.";
}
