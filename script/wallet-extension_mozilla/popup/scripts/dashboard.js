// scripts/dashboard.js
import { getWalletData, logout } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Verifica autenticação
  const walletData = getWalletData();
  if (!walletData) {
    logout();
    return;
  }
  const walletAddress = walletData.address;

  // Verifica Supabase (supondo que init-supabase.js já tenha feito window.supabaseClient)
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    const transactionListFallback = document.getElementById('transactionList');
    if (transactionListFallback) {
      transactionListFallback.innerHTML = `
        <div class="empty-state error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erro ao conectar ao banco de dados.</p>
        </div>`;
    }
    // Continua exibindo demais dados estáticos da wallet, mas sem histórico de transações
  }
  const supabase = window.supabaseClient;

  // Elementos da UI
  const walletAddressEl = document.getElementById('walletAddress');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const balanceAmountEl = document.getElementById('balanceAmount');
  const balanceFiatEl = document.getElementById('balanceFiat');
  const logoutBtn = document.getElementById('logoutBtn');
  const viewAllBtn = document.getElementById('viewAllBtn');
  const navItems = document.querySelectorAll('.nav-item');
  const transactionList = document.getElementById('transactionList');

  // Função utilitária para encurtar endereço
  function shortenAddress(addr, chars = 4) {
    if (!addr || typeof addr !== 'string') return '—';
    const clean = addr.startsWith('0x') ? addr.substring(2) : addr;
    if (clean.length <= chars * 2) return clean;
    return `${clean.slice(0, chars)}...${clean.slice(-chars)}`;
  }

  // Função para formatar data/hora em pt-BR
  function formatDateTime(dateString) {
    if (!dateString) return '—';
    const d = new Date(dateString);
    // Ajusta para locale pt-BR
    return d.toLocaleString('pt-BR');
  }

  // Mensagem caso não haja transações
  function showNoTransactionsMessage() {
    if (!transactionList) return;
    transactionList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exchange-alt"></i>
        <p>Não há transações</p>
      </div>`;
  }

  // Mensagem de erro ao carregar transações
  function showErrorMessage(msg) {
    if (!transactionList) return;
    transactionList.innerHTML = `
      <div class="empty-state error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Erro ao carregar transações</p>
        <small>${msg}</small>
      </div>`;
  }

  // Renderiza até 3 últimas transações
  function renderLastTransactions(transactions) {
    if (!transactionList) return;
    transactionList.innerHTML = '';
    transactions.forEach(tx => {
      const isReceived = tx.type === 'received';
      const dateFmt = tx.created_at ? formatDateTime(tx.created_at) : '—';
      const amountNum = parseFloat(tx.amount) || 0;
      const amountFmt = (isReceived ? '+' : '-') + amountNum.toFixed(4);
      const iconDir = isReceived ? 'down' : 'up';
      const label = isReceived ? 'Recebido' : 'Enviado';
      const statusText = tx.status === 'pending' ? 'Pendente' : 'Confirmado';
      const statusClass = tx.status === 'pending' ? 'pending' : 'confirmed';

      const itemHTML = `
        <div class="transaction-item ${tx.type}">
          <div class="transaction-icon">
            <i class="fas fa-arrow-${iconDir}"></i>
          </div>
          <div class="transaction-details">
            <div class="transaction-meta">
              <span class="transaction-type">${label}</span>
              <span class="transaction-date">${dateFmt}</span>
            </div>
            <div class="transaction-info">
              <span class="transaction-amount">${amountFmt} ${tx.currency || 'SUN'}</span>
              <span class="transaction-status ${statusClass}">${statusText}</span>
            </div>
          </div>
        </div>`;
      transactionList.insertAdjacentHTML('beforeend', itemHTML);
    });
  }

  // Busca as últimas 3 transações do endereço
  async function loadLastTransactions() {
    if (!supabase) {
      // Já mostrou erro de conexão antes
      return;
    }
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        showNoTransactionsMessage();
      } else {
        renderLastTransactions(transactions);
      }
    } catch (err) {
      console.error('Erro loadLastTransactions:', err);
      showErrorMessage(err.message || 'Erro desconhecido');
    }
  }

  // Atualiza UI com dados da wallet real
  if (walletAddressEl) {
    walletAddressEl.textContent = shortenAddress(walletAddress);
  }
  if (balanceAmountEl) {
    const balNum = Number(walletData.balance || 0);
    balanceAmountEl.textContent = balNum.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  if (balanceFiatEl) {
    const rate = Number(walletData.conversionRate || 1);
    const balNum = Number(walletData.balance || 0);
    const converted = balNum * rate;
    balanceFiatEl.textContent = `≈ ${converted.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} KW`;
  }

  // Eventos de UI
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(walletAddress)
        .then(() => {
          const originalHtml = copyAddressBtn.innerHTML;
          copyAddressBtn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => {
            copyAddressBtn.innerHTML = originalHtml;
          }, 2000);
        })
        .catch(err => {
          console.error('Falha ao copiar endereço:', err);
          alert('Falha ao copiar endereço. Tente novamente.');
        });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja sair?')) {
        logout();
      }
    });
  }

  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      window.location.href = 'transactions.html';
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', function () {
      const page = this.getAttribute('data-page');
      if (page && page !== 'dashboard') {
        window.location.href = `${page}.html`;
      }
    });
  });

  // Carrega últimas 3 transações ao iniciar
  await loadLastTransactions();
});
