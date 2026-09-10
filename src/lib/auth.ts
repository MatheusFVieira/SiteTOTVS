export interface UsuarioLogado {
  idVendedor: number;
  nomeVendedor: string;
  email: string;
  admin: "S" | "N";
}

export const getUsuarioLogado = (): UsuarioLogado | null => {
  if (typeof window === "undefined") return null;
  try {
    const dados = localStorage.getItem("usuario_totvs");
    return dados ? JSON.parse(dados) : null;
  } catch {
    return null;
  }
};

export const setUsuarioLogado = (user: UsuarioLogado) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("usuario_totvs", JSON.stringify(user));
    // Dispara um evento para notificar a sidebar instantaneamente
    window.dispatchEvent(new Event("auth-change"));
  }
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("usuario_totvs");
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/login";
  }
};