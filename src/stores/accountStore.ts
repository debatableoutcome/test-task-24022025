import { defineStore } from 'pinia'

export interface Account {
  labels: { text: string }[]
  type: 'Локальная' | 'LDAP'
  login: string
  password: string | null
}

export const useAccountStore = defineStore('accountStore', {
  state: () => ({
    accounts: [] as Account[],
  }),
  actions: {
    addAccount(account: Account) {
      this.accounts.push(account)
      this.saveAccounts()
    },
    removeAccount(index: number) {
      this.accounts.splice(index, 1)
      this.saveAccounts()
    },
    updateAccount(index: number, updatedAccount: Account) {
      this.accounts[index] = updatedAccount
      this.saveAccounts()
    },
    saveAccounts() {
      localStorage.setItem('accounts', JSON.stringify(this.accounts))
    },
    loadAccounts() {
      const savedAccounts = localStorage.getItem('accounts')
      if (savedAccounts) {
        this.accounts = JSON.parse(savedAccounts)
      }
    },
  },
})
