<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="userFilter.email" :placeholder="$t('user.email')" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter"/>
      <el-input v-model="userFilter.phone" :placeholder="$t('user.phone')" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter"/>
      <el-input v-model="userFilter.company" :placeholder="$t('user.company')" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter"/>
      <el-select v-model="userFilter.state" :placeholder="$t('user.state')" style="width: 150px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in userStateOptions" :key="item.key" :label="$t(`user.${item.key}`)" :value="item.key"/>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('user.search') }}</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="onCreateUserClick">{{ $t('user.create') }}</el-button>
    </div>
    <el-table v-loading="userLoading" :data="userList" border fit highlight-current-row style="width: 100%;">
      <el-table-column :label="$t('user.id')" prop="id" align="center" width="70px">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :formatter="userStateFormatter" :label="$t('user.state')" prop="state" width="80px" align="center"/>
      <el-table-column :label="$t('user.email')" prop="email" min-width="180px" align="center"/>
      <el-table-column :label="$t('user.phone')" prop="phone" width="160px" align="center"/>
      <el-table-column :formatter="decodeBase64Formatter" :label="$t('user.company')" prop="company" min-width="160px" align="center"/>
      <el-table-column :formatter="decodeBase64Formatter" :label="$t('user.commit')" prop="commit" min-width="200px" align="center"/>
      <el-table-column :label="$t('user.operate')" align="center" width="260px" class-name="small-padding " fixed="right">
        <template slot-scope="scope">
          <el-button type="info" size="mini" class-name="fixed-width" @click="onUpdateUserClick(scope.row)">{{ $t('user.edit') }}</el-button>
          <el-button type="warning" size="mini" @click="onChangePasswordClick(scope.row)">{{ $t('user.changePassword') }}</el-button>
          <el-button type="danger" size="mini" class-name="fixed-width" @click="handleStateUser(scope.row)">{{ scope.row.state === 0 ? $t('user.disable') : $t('user.enable') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="userTotal>0" :total="userTotal" :page.sync="queryPage" :limit.sync="queryLimit" @pagination="getUserList"/>

    <el-dialog v-el-drag-dialog :visible.sync="dialogUserVisible" :title="dialogUserModel === 'create' ? $t('user.createRootUserTitle') : $t('user.updateRootUserTitle')" :close-on-click-modal="false">
      <el-form ref="userForm" :model="formUser" :rules="userRules" :label-width="dialogUserModel === 'create' ? (language === 'zh' ? '100px' : '150px') : '100px'">
        <el-form-item :label="$t('user.email')" prop="email">
          <el-input v-model="formUser.email" :readonly="dialogUserModel === 'update'"/>
        </el-form-item>
        <el-form-item v-show="dialogUserModel === 'create'" :label="$t('user.password')" prop="password">
          <el-input v-model="formUser.password" type="password"/>
        </el-form-item>
        <el-form-item v-show="dialogUserModel === 'create'" :label="$t('user.confirmPassword')" prop="confirmPassword">
          <el-input v-model="formUser.confirmPassword" type="password"/>
        </el-form-item>
        <el-form-item :label="$t('user.phone')">
          <el-input v-model="formUser.phone"/>
        </el-form-item>
        <el-form-item :label="$t('user.company')">
          <el-input v-model="formUser.company"/>
        </el-form-item>
        <el-form-item :label="$t('user.commit')">
          <el-input :rows="3" v-model="formUser.commit" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogUserVisible = false">{{ $t('user.cancelButtonText') }}</el-button>
        <el-button :loading="dialogUserLoading" type="primary" @click="handleUser(dialogUserModel)">
          {{ dialogUserModel === 'create' ? $t('user.createButtonText') : $t('user.updateButtonText') }}
        </el-button>
      </span>
    </el-dialog>
    <el-dialog v-el-drag-dialog :visible.sync="dialogChangePasswordVisible" :title="$t('user.changePassword')" :close-on-click-modal="false">
      <el-form ref="passwordForm" :model="formPassword" :rules="passwordRules" :label-width="language === 'zh' ? '100px' : '150px'">
        <el-form-item :label="$t('user.email')">
          <el-input v-model="formPassword.email" readonly/>
        </el-form-item>
        <el-form-item :label="$t('user.oldPassword')" prop="oldPassword">
          <el-input v-model="formPassword.oldPassword" type="password"/>
        </el-form-item>
        <el-form-item :label="$t('user.newPassword')" prop="newPassword">
          <el-input v-model="formPassword.newPassword" type="password"/>
        </el-form-item>
        <el-form-item :label="$t('user.confirmPassword')" prop="confirmPassword">
          <el-input v-model="formPassword.confirmPassword" type="password"/>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogChangePasswordVisible = false">{{ $t('user.cancelButtonText') }}</el-button>
        <el-button :loading="dialogChangePasswordLoading" type="primary" @click="handleChangePassword">
          {{ $t('user.changeButtonText') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { scanRootUser, createRootUser, updateRootUser, updateRootUserState, updateRootUserPassword } from '@/api/user'
import { isValidEmail } from '@/utils/validate'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui

export default {
  components: { Pagination },
  directives: { elDragDialog },
  data() {
    const validateEmail = (rule, value, callback) => {
      if (!isValidEmail(value)) {
        callback(new Error(this.$t('user.validEmailTips')))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error(this.$t('user.validPasswordTips')))
      } else {
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.formUser.password) {
        callback(new Error(this.$t('user.validConfirmPasswordTips')))
      } else {
        callback()
      }
    }
    return {
      dialogUserVisible: false,
      dialogUserModel: '',
      dialogUserLoading: false,
      dialogChangePasswordVisible: false,
      dialogChangePasswordLoading: false,
      userFilter: {
        email: '',
        phone: '',
        company: '',
        state: 'all'
      },
      userStateOptions: [{ key: 'all' }, { key: 'enable' }, { key: 'disable' }],
      queryPage: 1,
      queryLimit: 10,
      userLoading: false,
      userTotal: 0,
      userList: [],
      formUser: {
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        company: '',
        commit: ''
      },
      userRules: {
        email: [{ required: true, trigger: 'blur', validator: validateEmail }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        confirmPassword: [{ required: true, trigger: 'blur', validator: validateConfirmPassword }]
      },
      formPassword: {
        email: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [{ required: true, trigger: 'blur', validator: validatePassword }],
        newPassword: [{ required: true, trigger: 'blur', validator: validatePassword }],
        confirmPassword: [{ required: true, trigger: 'blur', validator: (rule, value, callback) => {
          if (value !== this.formPassword.newPassword) {
            callback(new Error(this.$t('user.validConfirmPasswordTips')))
          } else {
            callback()
          }
        } }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'language'
    ])
  },
  created() {
    this.getUserList()
  },
  methods: {
    getUserList() {
      this.userLoading = true
      const query = {
        position: (this.queryPage - 1) * this.queryLimit,
        limit: this.queryLimit,
        where: []
      }
      if (this.userFilter.email) {
        const where = {
          name: 'email',
          value: this.userFilter.email,
          oper: 'regex'
        }
        query.where.push(where)
      }
      if (this.userFilter.phone) {
        const where = {
          name: 'phone',
          value: this.userFilter.phone,
          oper: 'regex'
        }
        query.where.push(where)
      }
      if (this.userFilter.company) {
        const where = {
          name: 'company',
          value: new Buffer(this.userFilter.company).toString('base64'),
          oper: 'regex'
        }
        query.where.push(where)
      }
      if (this.userFilter.state !== 'all') {
        const where = {
          name: 'state',
          value: this.userFilter.state === 'enable' ? 0 : 1,
          oper: 'eq'
        }
        query.where.push(where)
      }
      console.log(query)
      scanRootUser(query).then(response => {
        this.userTotal = response.tot_result_size
        this.userList = response.results
        // console.log(response)
        this.userLoading = false
      }).catch(error => {
        console.log(error)
        this.$message.error(this.$t('device.scanDeviceFailedTips'))
      })
    },
    onCreateUserClick() {
      this.dialogUserModel = 'create'
      this.dialogUserVisible = true
    },
    onUpdateUserClick(row) {
      this.dialogUserModel = 'update'
      this.formUser.email = row.email
      this.formUser.password = ''
      this.formUser.confirmPassword = ''
      this.formUser.phone = row.phone
      this.formUser.company = new Buffer(row.company, 'base64').toString()
      this.formUser.commit = new Buffer(row.commit, 'base64').toString()
      this.dialogUserVisible = true
    },
    onChangePasswordClick(row) {
      this.formPassword.email = row.email
      this.formPassword.oldPassword = ''
      this.formPassword.newPassword = ''
      this.formPassword.confirmPassword = ''
      this.dialogChangePasswordVisible = true
    },
    handleChangePassword() {
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          this.dialogChangePasswordLoading = true
          updateRootUserPassword(this.formPassword.email, {
            oldPassword: this.formPassword.oldPassword,
            newPassword: this.formPassword.newPassword
          }).then(response => {
            this.dialogChangePasswordLoading = false
            this.dialogChangePasswordVisible = false
            console.log(response)
            this.$message({
              type: 'success',
              message: this.$t('user.changePasswordSucceedTips')
            })
          }).catch(error => {
            console.log(error)
            this.$message.error(this.$t('user.changePasswordFailedTips'))
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleStateUser(row) {
      this.$confirm(row.state === 0 ? this.$t('user.confirmDisableRootUserTips') : this.$t('user.confirmEnableRootUserTips'), this.$t('user.confirmTitle'), {
        confirmButtonText: this.$t('user.confirmButtonText'),
        cancelButtonText: this.$t('user.cancelButtonText'),
        type: 'warning'
      }).then(() => {
        var state = row.state === 0 ? 1 : 0
        var email = row.email
        updateRootUserState(email, state).then(response => {
          this.$message({
            type: 'success',
            message: row.state === 0 ? this.$t('user.disableRootUserSucceedTips') : this.$t('user.enableRootUserSucceedTips')
          })
          this.getUserList()
        }).catch(error => {
          console.log(error)
          this.$message.error(row.state === 0 ? this.$t('user.disableRootUserFailedTips') : this.$t('user.enableRootUserFailedTips'))
        })
      }).catch(() => {
      })
    },
    userStateFormatter(row, column, cellValue, index) {
      return cellValue === 0 ? this.$t('user.enable') : this.$t('user.disable')
    },
    decodeBase64Formatter(row, column, cellValue, index) {
      if (cellValue) {
        return new Buffer(cellValue, 'base64').toString()
      } else {
        return ''
      }
    },
    handleUser(model) {
      if (model === 'create') {
        this.handleCreateUser()
      } else {
        this.handleUpdateUser()
      }
    },
    handleCreateUser() {
      this.$refs.userForm.validate(valid => {
        if (valid) {
          this.dialogUserLoading = true
          createRootUser(this.formUser).then(response => {
            this.dialogUserLoading = false
            this.dialogUserVisible = false
            this.formUser.email = ''
            this.formUser.password = ''
            this.formUser.confirmPassword = ''
            this.formUser.phone = ''
            this.formUser.company = ''
            this.formUser.commit = ''
            this.$message({
              type: 'success',
              message: this.$t('user.createRootUserSucceedTips')
            })
            this.getUserList()
          }).catch(error => {
            console.log(error)
            this.$message.error(this.$t('user.createRootUserFailedTips'))
            this.dialogUserLoading = false
            this.dialogUserVisible = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleUpdateUser() {
      this.dialogUserLoading = true
      updateRootUser(this.formUser).then(response => {
        this.dialogUserLoading = false
        this.dialogUserVisible = false
        this.$message({
          type: 'success',
          message: this.$t('user.updateRootUserSucceedTips')
        })
        this.getUserList()
      }).catch(error => {
        console.log(error)
        this.$message.error(this.$t('user.updateRootUserFailedTips'))
        this.dialogUserLoading = false
        this.dialogUserVisible = false
      })
    },
    handleFilter() {
      this.queryPage = 1
      this.getUserList()
    }
  }
}
</script>

<style>

</style>
