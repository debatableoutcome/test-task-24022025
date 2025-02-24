import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface Account {
  labels: { text: string }[]
  type: 'Локальная' | 'LDAP'
  login: string
  password: string | null
}

export const useAccountStore = defineStore('accountStore', {
  state: () => ({
    accounts: reactive([] as Account[]),
  }),

  actions: {
    addAccount(account: Account) {
      account.labels = this.normalizeLabels(account.labels)
      this.accounts.push(account)
      this.saveAccounts()
    },

    removeAccount(index: number) {
      const removedAccount = this.accounts[index]
      this.accounts.splice(index, 1)
      this.saveAccounts()
    },

    updateAccount(index: number, updatedAccount: Account) {
      updatedAccount.labels = this.normalizeLabels(updatedAccount.labels)
      this.accounts[index] = { ...updatedAccount }
      this.saveAccounts()
    },

    saveAccounts() {
      localStorage.setItem('accounts', JSON.stringify(this.accounts))
    },

    loadAccounts() {
      const savedAccounts = localStorage.getItem('accounts')
      if (savedAccounts) {
        const parsedAccounts = JSON.parse(savedAccounts)
        this.accounts.splice(
          0,
          this.accounts.length,
          ...parsedAccounts.map((account: Account) => ({
            ...account,
            labels: this.normalizeLabels(account.labels),
          })),
        )
      }
    },

    normalizeLabels(labels: any): { text: string }[] {
      if (Array.isArray(labels)) {
        return labels.map((label) => (typeof label === 'string' ? { text: label } : label))
      }
      return []
    },
  },
})
