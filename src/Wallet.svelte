<script>
  import Tier from "./Tier.svelte";
  import { Claimer, Tiers, Connection, User } from "./stores.js";
  import { getNotificationsContext } from "svelte-notifications";
  import FaSync from 'svelte-icons/fa/FaSync.svelte'

  const { addNotification } = getNotificationsContext();

  $: num_days = 0;
  $: balance = 0;

  // const handleUnfreeze = async () => {

  //   tx_OnGoing.set(true);
  //   console.log("Unfreezing");

  //   /// Join to tier
  //   await minter.methods.unfreeze($Pay_Token_Address).send({ from: $Account })
  //     .once("sent", () => tx_Message.set("waiting for approval"))
  //     .once("transactionHash", (hash) => tx_Message.set("transaction sent"))
  //     .on("error", (err) =>
  //       addNotification({
  //         text: "Unfreeze error: " + err.message,
  //         position: "top-right",
  //         type: "danger",
  //         removeAfter: 8000,
  //       })
  //     )
  //     .then(() =>
  //       addNotification({
  //         text: "Funds unfreezed",
  //         position: "top-right",
  //         type: "success",
  //         removeAfter: 8000,
  //       })
  //     )
  //     .catch(() => {}) // this avoid a warning in console
  //     .finally(function (receipt) {
  //       tx_Message.set("");
  //       tx_OnGoing.set(false);
  //     });

  //   window.refreshUserInfo();
  // };

  const handleUnClaim = async () => {
    await handleRefesh();
		let connection = $Connection;

    if ($User.reward > 0) {
      try {
        connection.tx_Message = 'Claiming reward';
        connection.tx_OnGoing = true;
        Connection.set(connection); 

		await $Claimer.contract.methods.claim().send({ from: $Connection.account })
		.once('sent', () => {
				connection.tx_Message = 'waiting for approval';
				Connection.set(connection); 
    })
		.once('transactionHash',  (hash) => {
				connection.tx_Message = 'transaction sent';
				Connection.set(connection); 
    })
		.on('error', err => 
			addNotification({
			text: 'Can\'t mint reward: ' + err.message,
			position: "top-right",
			type: "danger",
			removeAfter: 8000,
		}))
		.then(() => 
            addNotification({
            text: 'Reward minted',
            position: "top-right",
            type: "success",
            removeAfter: 8000,
        }));

      } finally {
        connection.tx_Message = '';
        connection.tx_OnGoing = false;
        Connection.set(connection); 
      }
    } else {
      addNotification({
        text: "Nothing to claim",
        position: "top-right",
        type: "warning",
        removeAfter: 8000,
      });
    }

    handleRefesh();
  };

  const handleRefesh = async () => {
    await window.refreshUserInfo();
  };
</script>

<div class="wallet">
  {#if $User.tier > 0}
    <Tier
      tier_name={$Claimer.tier[$User.tier-1].tier_name}
      join_cost={$Claimer.tier[$User.tier-1].join_cost}
      tier_num={$Claimer.tier[$User.tier-1].tier_num}
      reward_token_symbol={ $Claimer.simbol }
      pay_token_symbol={ $Tiers.simbol }
    />
  {:else}
    <Tier
      tier_name="Untier"
      join_cost="0"
      tier_num="-1"
      reward_token_symbol={ $Claimer.simbol }
      pay_token_symbol={ $Tiers.simbol }
    />
  {/if}
  <div>
    <!-- auto add to metamask -->
    <p>Prestige points : {$User.balance} { $Claimer.simbol }</p>
    <p>Investment : {$User.funds} { $Tiers.simbol }</p>
    <p class="tooltip">
      Days since investment : {$User.funds>0?
        ((Math.ceil(new Date().getTime()/1000)-$User.affiliation_date)/86400).toFixed(1)
        :
        0}
      {#if $User.tier >= 0}
        <span class="tooltiptext tooltop-large">
          invested on {new Date($User.affiliation_date * 1000)}
        </span>
      {/if}
    </p>
    <p>Current Mintiable Reward : {parseFloat($User.reward/10e17).toFixed(18)} {$Claimer.simbol}</p>
    <div>
      <button
        class="btn tooltip"
        disabled={$User.reward <= 0 || $Connection.tx_OnGoing}
        on:click={handleUnClaim}>
          Claim
          {#if $User.reward <= 0 }
            <span class="tooltiptext">
              Not reward to claim
            </span>
          {/if}
      </button>
      <button class="btn tooltip" disabled={$Connection.tx_OnGoing} on:click={handleRefesh}>
          <div class="icon {$Connection.tx_OnGoing ? 'animated' : ''}"><FaSync /></div>
		        <span class="tooltiptext">
            Refresh
        </span>
      </button>
    </div>
  </div>
</div>

<style>
  .wallet {
    display: flex;
    justify-content: center;
  }

  .wallet > div {
    justify-content: space-evenly;
    display: flex;
    flex-direction: column;
    font-size: 1.2rem;
    padding-left: 1.5em;
  }

  .wallet p {
    align-self: flex-start;
  }

  .wallet .btn {
    align-self: center;
    display: inline-flex;
    align-items: center;
  }

  .icon {
    width: 1rem;
    height: 1rem;
  }

  .animated {
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
</style>
