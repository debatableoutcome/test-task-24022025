<template>
  <div class="account-form">
    <h1>Учетные записи</h1>
    <el-button type="primary" @click="addAccount">Добавить учетную запись</el-button>

    <div v-for="(account, index) in accountStore.accounts" :key="index" class="account-entry">
      <el-input
        v-model="accountLabelInput[index]"
        @blur="processLabels(index)"
        placeholder="Метки (через ;)"
        :class="{ error: errors[index]?.labels }"
      />

      <el-select v-model="account.type" @change="handleTypeChange(index)">
        <el-option label="Локальная" value="Локальная" />
        <el-option label="LDAP" value="LDAP" />
      </el-select>

      <el-input
        v-model="account.login"
        @blur="validateLogin(index)"
        placeholder="Логин"
        :class="{ error: errors[index]?.login }"
      />

      <el-input
        v-if="account.type === 'Локальная'"
        v-model="account.password"
        show-password
        @blur="validatePassword(index)"
        placeholder="Пароль"
        :class="{ error: errors[index]?.password }"
      />

      <el-button type="danger" @click="removeAccount(index)">Удалить</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from 'vue'
import { useAccountStore, type Account } from '@/stores/accountStore'
import { ElMessage } from 'element-plus'

const accountStore = useAccountStore()
const errors = reactive<{ [key: number]: any }>({})
const accountLabelInput = reactive<{ [key: number]: string }>({})

onMounted(() => {
  accountStore.loadAccounts()
})

const addAccount = () => {
  const newAccount: Account = {
    labels: [],
    type: 'Локальная',
    login: '',
    password: '',
  }
  accountStore.addAccount(newAccount)
}

const removeAccount = (index: number) => {
  accountStore.removeAccount(index)
}

const processLabels = (index: number) => {
  const rawLabels = accountLabelInput[index] || ''
  const labels = rawLabels
    .split(';')
    .map((label) => label.trim())
    .filter((label) => label !== '')
    .map((label) => ({ text: label }))
  if (labels.some((label) => label.text.length > 50)) {
    errors[index] = { ...errors[index], labels: true }
  } else {
    errors[index] = { ...errors[index], labels: false }
    accountStore.accounts[index].labels = labels
    accountStore.saveAccounts()
  }
}

const validateLogin = (index: number) => {
  const login = accountStore.accounts[index].login
  errors[index] = {
    ...errors[index],
    login: !login || login.length > 100,
  }
  if (!errors[index].login) accountStore.saveAccounts()
}

const validatePassword = (index: number) => {
  const password = accountStore.accounts[index].password || ''
  errors[index] = {
    ...errors[index],
    password: password.length === 0 || password.length > 100,
  }
  if (!errors[index].password) accountStore.saveAccounts()
}

const handleTypeChange = (index: number) => {
  const account = accountStore.accounts[index]
  if (account.type === 'LDAP') {
    account.password = null
  }
  accountStore.saveAccounts()
}
</script>

<style scoped>
.account-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.account-entry {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.error {
  border-color: red !important;
}
</style>
