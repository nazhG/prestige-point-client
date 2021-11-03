import { writable } from "svelte/store";

const Claimer = writable({
    tier: [
      {
        tier_name: "Bronze",
        join_cost: .5 * 10e6,
        tier_num: 1,
      },
      {
        tier_name: "Silver",
        join_cost: 1 * 10e6,
        tier_num: 2,
      },
      {
        tier_name: "Gold",
        join_cost: 2.5 * 10e6,
        tier_num: 3,
      },
      {
        tier_name: "Platinum",
        join_cost: 5 * 10e6,
        tier_num: 4,
      },
    ],
    simbol: "TVP",
    address: "0xcB8dA592C61eF0A57B088BFf429494163F0b5c8e",
    contract: null,
  }),
  Tiers = writable({
    address: "0x3a2F08ED7b2D50CB5813CB04694C4d9f38fB49a1",
    payment: "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
    simbol: "USDC",
    contract: null,
  }),
  Connection = writable({
    web3: null,
    logged: false,
    account: null,
    chainId: null,
    tx_OnGoing: false,
    tx_Message: "",
  }),
  User = writable({
    balance: 0,
    affiliation_date: 0,
    funds: 0,
    tier: -1,
    reward: 0,
  });

export { Claimer, Tiers, Connection, User };
