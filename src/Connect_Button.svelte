<script>
  import { getNotificationsContext } from "svelte-notifications";
  import { onMount } from "svelte";
  import detectEthereumProvider from '@metamask/detect-provider';
  import { getContext } from 'svelte';
  import { useNavigate, useLocation } from "svelte-navigator";
  import Modal from './Modal.svelte';
	import { Connection, User } from './stores.js';
  import FaSpinner from 'svelte-icons/fa/FaSpinner.svelte'

const { open } = getContext('simple-modal');
const { addNotification } = getNotificationsContext();

const navigate = useNavigate();
const location = useLocation();

let provider, connection = $Connection;

onMount(async () => {
  provider = await detectEthereumProvider();
  if (provider) {
    connection.web3 = new Web3(provider);
		Connection.set(connection); 
  } else {
    open(Modal, { message: 'To connect you will need MetaMask. 🦊',
    linkRef: 'https://metamask.io/download',
    linkText: 'How to download metaMask?', });
    console.log('No provider found');
  }

  handleChainChanged(await ethereum.request({ method: 'eth_chainId' }));

  ethereum
    .request({ method: 'eth_accounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      console.error(err);
  });

  ethereum.on('chainChanged', handleChainChanged);

  ethereum.on('accountsChanged', handleAccountsChanged);
});

const handleChainChanged = (_chainId) => {
  connection.chainId = parseInt(_chainId); // hex to dec
	Connection.set(connection); 
  console.log('chain Id: ', parseInt(_chainId));
  if ($Connection.chainId && $Connection.chainId != 80001) {
    open(Modal, { message: 'Please, change the chain to mumbai',
      linkRef: 'https://docs.matic.network/docs/develop/metamask/testnet/',
      linkText: 'How add the chain to MetaMask?',
    });
  }
  // window.location.reload();
};

const handleAccountsChanged = async (_accounts) => {
  if (_accounts.length === 0) {
    addNotification({
      text: 'Please connect to MetaMask.',
      position: "top-right",
      type: "danger",
      removeAfter: 5000,
    });
    connection.logged = false;
    connection.account = null;
    connection.web3 = null;
		Connection.set(connection); 

    let user = $User;
    user.funds = 0;
    user.tier = -1;
    user.affiliation_date = 0;
    user.reward = 0;
    User.set(user);
  } else if (_accounts[0] !== $Connection.account) {
    connection.logged = true;
    connection.account = _accounts[0];
    connection.web3 = new Web3(provider);
		Connection.set(connection); 

		window.refreshUserInfo();
    
    if ($User.tier >= 0) {
      navigate("/wallet", {
        state: { from: $location.pathname }
      });
    }

    addNotification({
      text: 'Connected to ' + accountFilter($Connection.account),
      position: "top-right",
      type: "success",
      removeAfter: 3000,
    });

    handleChainChanged(await ethereum.request({ method: 'eth_chainId' }));
  }
};

const handleConnect = () => {
  ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      addNotification({
        text: 'Connection error: ' + err.message,
        position: "top-right",
        type: "danger",
        removeAfter: 5000,
      });
    });
};

const accountFilter = (_account) => {
  let ac = String(_account);
  return `${ac.substr(0, 6)}...${ac.substr(ac.length - 4, 4)}`;
};

</script>

<button
	class="btn btn-connect tooltip { $Connection.logged ? ($Connection.chainId != 80001 ? 'warnig' : 'success') : '' }"
	on:click={handleConnect}
	disabled={$Connection.logged}>
  {#if $Connection.logged}
    { accountFilter($Connection.account) }
    <span class="tooltiptext">
			{#if $Connection.chainId != 80001}
        Wrong chain
			{:else}
        Connected
			{/if}
      </span>
    {#if $Connection.tx_Message}
    <div class="loading">
      <div class="icon"><FaSpinner /></div>&nbsp;{ $Connection.tx_Message }
    </div>
    {/if}
  {:else}
    Connect MetaMask
  {/if}
</button>

<style>

  .loading {
    display: flex;
    align-items: center;
  }

  .icon {
    color: white;
    animation-name: spin;
    animation-duration: 1000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear; 
  }

  @keyframes spin {
      from {
          transform:rotate(0deg);
      }
      to {
          transform:rotate(360deg);
      }
  }

  .warnig {
    color: white;
    background-color: #ffb900;
  }
  
  .success {
    color: white;
    background-color: #22ce6c;
  }

  .tooltip .tooltiptext {
    bottom: 110% !important;
    max-width: 300px;
  }

</style>
