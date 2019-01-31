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
      <el-table-column :label="$t('user.permission')" align="center" min-width="600px">
        <template slot-scope="scope" >
          <div style="display: flex; flex-direction: row; justify-content: space-around;">
            <el-tag :class="(scope.row.permission & 0x1) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x1) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 管理根账号
            </el-tag>
            <el-tag :class="(scope.row.permission & 0x10) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x10) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 管理资源授权账号
            </el-tag>
            <el-tag :class="(scope.row.permission & 0x100) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x100) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 管理AccessKey
            </el-tag>
            <el-tag :class="(scope.row.permission & 0x1000) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x1000) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 管理设备
            </el-tag>
            <el-tag :class="(scope.row.permission & 0x10000) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x10000) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 管理分组
            </el-tag>
            <el-tag :class="(scope.row.permission & 0x100000) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x100000) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 管理流量
            </el-tag>
          </div>
          <div style="display: flex; flex-direction: row; margin-top: 2px; justify-content: space-around;">
            <el-tag :class="(scope.row.permission & 0x2) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x2) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 浏览根账号
            </el-tag>
            <el-tag :class="(scope.row.permission & 0x20) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x20) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 浏览资源授权账号
            </el-tag>
            <el-tag :class="(scope.row.permission & 0x200) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x200) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 浏览AccessKey
            </el-tag>
            <el-tag :class="(scope.row.permission & 0x2000) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x2000) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 浏览设备
            </el-tag>
            <el-tag :class="(scope.row.permission & 0x20000) > 0 ? '' : 'tag-disable'" size="mini" >
              <i :class="(scope.row.permission & 0x20000) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 浏览分组
            </el-tag>
            <el-tag :class="(scope.row.permission & 0x200000) > 0 ? '' : 'tag-disable'" size="mini">
              <i :class="(scope.row.permission & 0x200000) > 0 ? 'el-icon-circle-check-outline' : 'el-icon-circle-close-outline'"/> 浏览流量
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column :formatter="decodeBase64Formatter" :label="$t('user.commit')" prop="commit" min-width="200px" align="center"/>
      <el-table-column :label="$t('user.operate')" :width="language === 'zh' ? '330pxpx' : '370px'" align="center" class-name="small-padding " fixed="right">
        <template slot-scope="scope">
          <el-button type="info" size="mini" class-name="fixed-width" @click="onUpdateUserClick(scope.row)">{{ $t('user.edit') }}</el-button>
          <el-button type="warning" size="mini" @click="onChangePasswordClick(scope.row)">{{ $t('user.changePassword') }}</el-button>
          <el-button type="warning" size="mini" @click="onChangePermissionClick(scope.row)">{{ $t('user.changePermission') }}</el-button>
          <el-button type="danger" size="mini" class-name="fixed-width" @click="handleStateUser(scope.row)">{{ scope.row.state === 0 ? $t('user.disable') : $t('user.enable') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="userTotal>0" :total="userTotal" :page.sync="queryPage" :limit.sync="queryLimit" @pagination="getUserList"/>
    <el-dialog v-el-drag-dialog :visible.sync="dialogUserVisible" :title="dialogUserModel === 'create' ? $t('user.createRamUserTitle') : $t('user.updateRamUserTitle')" :close-on-click-modal="false">
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
    <el-dialog v-el-drag-dialog :visible.sync="dialogChangePasswordVisible" :title="$t('user.changePasswordTitle')" :close-on-click-modal="false">
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
    <el-dialog v-el-drag-dialog :visible.sync="dialogChangePermissionVisible" :title="$t('user.changePermissionTitle')" :close-on-click-modal="false">
      <el-form ref="permissionForm" :model="formPermission" label-width="100px">
        <el-form-item :label="$t('user.email')">
          <el-input v-model="formPermission.email" readonly/>
        </el-form-item>
        <el-form-item :label="$t('user.permission')">
          <el-row>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.editRootUser">管理根账号</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.editRamUser">管理资源授权账号</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.editAccessKey">管理AccessKey</el-checkbox>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.scanRootUser">浏览根账号</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.scanRamUser">浏览资源授权账号</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.scanAccessKey">浏览AccessKey</el-checkbox>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.editDevice">管理设备</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.editGroup">管理分组</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.editTraffic">管理流量</el-checkbox>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.scanDevice">浏览设备</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.scanGroup">浏览分组</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox v-model="formPermission.scanTraffic">浏览流量</el-checkbox>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogChangePermissionVisible = false">{{ $t('user.cancelButtonText') }}</el-button>
        <el-button :loading="dialogChangePermissionLoading" type="primary" @click="handleChangePermission">
          {{ $t('user.changeButtonText') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { scanRamUser, createRamUser, updateRamUser, updateRamUserState, updateRamUserPassword, updateRamUserPermission } from '@/api/user'
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
      dialogChangePermissionVisible: false,
      dialogChangePermissionLoading: false,
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
      },
      formPermission: {
        email: '',
        editRootUser: false,
        scanRootUser: false,
        editRamUser: false,
        scanRamUser: false,
        editAccessKey: false,
        scanAccessKey: false,
        editDevice: false,
        scanDevice: false,
        editGroup: false,
        scanGroup: false,
        editTraffic: false,
        scanTraffic: false
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

      scanRamUser(query).then(response => {
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
      this.formUser.email = ''
      this.formUser.password = ''
      this.formUser.confirmPassword = ''
      this.formUser.phone = ''
      this.formUser.company = ''
      this.formUser.commit = ''
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
          updateRamUserPassword(this.formPassword.email, {
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
            this.dialogChangePasswordLoading = false
            console.log(error)
            this.$message.error(this.$t('user.changePasswordFailedTips'))
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    onChangePermissionClick(row) {
      this.formPermission.email = row.email
      console.log(row.permission)
      this.formPermission.editRootUser = (row.permission & 0x1) > 0
      this.formPermission.scanRootUser = (row.permission & 0x2) > 0
      this.formPermission.editRamUser = (row.permission & 0x10) > 0
      this.formPermission.scanRamUser = (row.permission & 0x20) > 0
      this.formPermission.editAccessKey = (row.permission & 0x100) > 0
      this.formPermission.scanAccessKey = (row.permission & 0x200) > 0
      this.formPermission.editDevice = (row.permission & 0x1000) > 0
      this.formPermission.scanDevice = (row.permission & 0x2000) > 0
      this.formPermission.editGroup = (row.permission & 0x10000) > 0
      this.formPermission.scanGroup = (row.permission & 0x20000) > 0
      this.formPermission.editTraffic = (row.permission & 0x100000) > 0
      this.formPermission.scanTraffic = (row.permission & 0x200000) > 0
      this.dialogChangePermissionVisible = true
    },
    handleChangePermission() {
      this.dialogChangePermissionLoading = true
      var permission = 0
      permission |= this.formPermission.editRootUser ? 0x1 : 0
      permission |= this.formPermission.scanRootUser ? 0x2 : 0
      permission |= this.formPermission.editRamUser ? 0x10 : 0
      permission |= this.formPermission.scanRamUser ? 0x20 : 0
      permission |= this.formPermission.editAccessKey ? 0x100 : 0
      permission |= this.formPermission.scanAccessKey ? 0x200 : 0
      permission |= this.formPermission.editDevice ? 0x1000 : 0
      permission |= this.formPermission.scanDevice ? 0x2000 : 0
      permission |= this.formPermission.editGroup ? 0x10000 : 0
      permission |= this.formPermission.scanGroup ? 0x20000 : 0
      permission |= this.formPermission.editTraffic ? 0x100000 : 0
      permission |= this.formPermission.scanTraffic ? 0x200000 : 0

      updateRamUserPermission(this.formPermission.email, permission).then(response => {
        this.dialogChangePermissionLoading = false
        this.dialogChangePermissionVisible = false
        console.log(response)
        this.$message({
          type: 'success',
          message: this.$t('user.changePermissionSucceedTips')
        })
        this.getUserList()
      }).catch(error => {
        this.dialogChangePermissionLoading = false
        console.log(error)
        this.$message.error(this.$t('user.changePermissionFailedTips'))
      })
    },
    handleStateUser(row) {
      this.$confirm(row.state === 0 ? this.$t('user.confirmDisableRamUserTips') : this.$t('user.confirmEnableRamUserTips'), this.$t('user.confirmTitle'), {
        confirmButtonText: this.$t('user.confirmButtonText'),
        cancelButtonText: this.$t('user.cancelButtonText'),
        type: 'warning'
      }).then(() => {
        var state = row.state === 0 ? 1 : 0
        var email = row.email
        updateRamUserState(email, state).then(response => {
          this.$message({
            type: 'success',
            message: row.state === 0 ? this.$t('user.disableRamUserSucceedTips') : this.$t('user.enableRamUserSucceedTips')
          })
          this.getUserList()
        }).catch(error => {
          console.log(error)
          this.$message.error(row.state === 0 ? this.$t('user.disableRamUserFailedTips') : this.$t('user.enableRamUserFailedTips'))
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
          createRamUser(this.formUser).then(response => {
            this.dialogUserLoading = false
            this.dialogUserVisible = false
            this.$message({
              type: 'success',
              message: this.$t('user.createRamUserSucceedTips')
            })
            this.getUserList()
          }).catch(error => {
            this.dialogUserLoading = false
            console.log(error)
            this.$message.error(this.$t('user.createRamUserFailedTips'))
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleUpdateUser() {
      this.dialogUserLoading = true
      updateRamUser(this.formUser).then(response => {
        this.dialogUserLoading = false
        this.dialogUserVisible = false
        this.$message({
          type: 'success',
          message: this.$t('user.updateRamUserSucceedTips')
        })
        this.getUserList()
      }).catch(error => {
        this.dialogUserLoading = false
        console.log(error)
        this.$message.error(this.$t('user.updateRamUserFailedTips'))
      })
    },
    handleFilter() {
      this.queryPage = 1
      this.getUserList()
    }
  }
}
</script>

<style lang="css" scoped>
.el-table >>> td {
  padding: 5px 0;
}
.tag-disable {
  color: #c0c4cc;
}
</style>
