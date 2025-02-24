<template>
  <div class="account-form">
    <div class="account-form__header">
      <h1 class="account-form__title">Учетные записи</h1>
      <button class="account-form__icon-button account-form__icon-button--add" @click="addAccount">
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <div v-if="showNotice" class="account-form__notice">
      <i class="fas fa-circle-question"></i>
      <span>
        Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
      </span>
      <button class="account-form__close-button" @click="closeNotice">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="account-table">
      <div class="account-table__header" :class="{ 'account-row--no-password': !hasLocalAccount }">
        <span class="account-table__column">Метки</span>
        <span class="account-table__column">Тип записи</span>
        <span class="account-table__column">Логин</span>
        <span v-if="hasLocalAccount" class="account-table__column">Пароль</span>
        <span class="account-table__column"></span>
      </div>

      <div
        v-for="(account, index) in accountStore.accounts"
        :key="index"
        :class="['account-row', { 'account-row--ldap': account.type === 'LDAP' }]"
      >
        <el-input
          v-model="accountLabelInput[index]"
          placeholder="Метки"
          @blur="processLabels(index)"
          :class="{ error: errors[index]?.labels }"
        />

        <el-select v-model="account.type" @change="handleTypeChange(index)">
          <el-option label="Локальная" value="Локальная" />
          <el-option label="LDAP" value="LDAP" />
        </el-select>

        <el-input
          v-model="account.login"
          placeholder="Логин"
          @blur="validateLogin(index)"
          :class="{ error: errors[index]?.login }"
        />

        <el-input
          v-if="account.type === 'Локальная'"
          v-model="account.password"
          placeholder="Пароль"
          show-password
          @blur="validatePassword(index)"
          :class="{ error: errors[index]?.password }"
        />

        <button
          @click="removeAccount(index)"
          class="account-form__icon-button account-form__icon-button--delete"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useAccountStore, type Account } from '@/stores/accountStore'

const accountStore = useAccountStore()
const errors = reactive<{ [key: number]: any }>({})
const accountLabelInput = reactive<{ [key: number]: string }>({})
const showNotice = ref(true)

const hasLocalAccount = computed(() =>
  accountStore.accounts.some((account) => account.type === 'Локальная'),
)

onMounted(() => {
  accountStore.loadAccounts()
  accountStore.accounts.forEach((account, index) => {
    accountLabelInput[index] = account.labels.map((label) => label.text).join('; ')
  })
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
    accountStore.updateAccount(index, accountStore.accounts[index])
  }
}

const validateLogin = (index: number) => {
  const login = accountStore.accounts[index].login.trim()
  errors[index] = {
    ...errors[index],
    login: !login || login.length > 100,
  }
  if (!errors[index].login) accountStore.saveAccounts()
}

const validatePassword = (index: number) => {
  const account = accountStore.accounts[index]
  const password = account.password?.trim() || ''

  if (account.type === 'Локальная') {
    errors[index] = {
      ...errors[index],
      password: !password || password.length > 100,
    }
  } else {
    errors[index] = {
      ...errors[index],
      password: false,
    }
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

const closeNotice = () => {
  showNotice.value = false
}
</script>

<style lang="scss" scoped>
.account-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;

    & h1 {
      margin: 0;
      font-size: 24px;
    }
  }

  &__icon-button {
    background: none;
    cursor: pointer;
    font-size: 18px;
    padding: 6px;
    transition: 0.2s ease-in-out;

    &:hover {
      color: #007bff;
    }

    &--delete {
      color: #ff4d4f;
      padding: 0;
      border: none;

      &:hover {
        color: #d9363e;
      }
    }

    &--add {
      border: 1px solid #007bff;
      border-radius: 4px;
      padding: 10px;
    }
  }

  &__notice {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: #f0f8ff;
    border: 1px solid #b3d4fc;
    padding: 12px;
    border-radius: 8px;
    position: relative;
  }

  &__close-button {
    background: none;
    border: none;
    cursor: pointer;
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 16px;
    color: #777;

    &:hover {
      color: #000;
    }
  }
}

.account-table {
  display: flex;
  flex-direction: column;
  width: 100%;

  &__header {
    display: grid;
    grid-template-columns: 21% 17% 36% 10%;
    width: 100%;
    font-weight: bold;
    padding: 8px;
    border-bottom: 1px solid #ccc;
    background-color: #f8f9ff;

    &__column {
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      border-right: 1px solid #e0e0e0;

      &:last-child {
        border-right: none;
      }
    }
  }
}

.account-row {
  display: grid;
  grid-template-columns: 200px 150px 1fr 200px 50px;
  align-items: center;
  padding: 8px 0;
  width: 100%;
  gap: 12px;

  &--ldap {
    grid-template-columns: 200px 150px 1fr 50px;
  }

  .el-input,
  .el-select {
    width: 100%;
  }

  .error {
    border-color: red !important;
    box-shadow: 0 0 4px rgba(255, 0, 0, 0.5);
  }
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 4px;
}
</style>
