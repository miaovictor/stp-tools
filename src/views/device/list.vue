<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6"><div class="grid-content bg-purple"/>
        <el-input
          v-model="groupFilter"
          :placeholder="$t('device.filterPlaceHolder')"
          style="padding-bottom: 20px;"/>
        <el-tree
          v-loading="groupLoading"
          ref="groupTree"
          :data="groupTreeData"
          :expand-on-click-node="false"
          :filter-node-method="filterGroup"
          node-key="id"
          default-expand-all>
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <el-button type="text" style="margin: 0;" icon="el-icon-circle-plus-outline" @click="onCreateGroupClick(data)"/>
              <el-button :disabled="data.id === 0" type="text" style="margin: 0;" icon="el-icon-edit-outline" @click="onUpdateGroupClick(data)"/>
              <el-button :disabled="data.id === 0" type="text" style="margin: 0;" icon="el-icon-circle-close-outline" @click="handleDeleteGroup(data)"/>
            </span>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="18"><div class="grid-content bg-purple"/>
        <div class="filter-container">
          <el-input v-model="deviceFilter.sn" :placeholder="$t('device.sn')" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter"/>
          <el-select v-model="deviceFilter.state" :placeholder="$t('device.state')" style="width: 150px" class="filter-item" @change="handleFilter">
            <el-option v-for="item in deviceStateOptions" :key="item.key" :label="$t(`device.${item.key}`)" :value="item.key"/>
          </el-select>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('device.search') }}</el-button>
          <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="onBindDeviceClick">{{ $t('device.bind') }}</el-button>
          <el-button :loading="exportLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleExport">{{ $t('device.export') }}</el-button>
        </div>

        <el-table v-loading="deviceLoading" :data="deviceList" border fit highlight-current-row style="width: 100%;">
          <el-table-column :label="$t('device.id')" prop="id" align="center" width="70px">
            <template slot-scope="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('device.state')" width="80px" align="center">
            <template slot-scope="scope">
              <svg-icon :icon-class="scope.row.state === 0 ? 'online' : 'offline'" class="state-icon"/>
            </template>
          </el-table-column>
          <el-table-column :formatter="deviceTypeFormatter" :label="$t('device.type')" prop="addtion.board_version" width="80px" align="center"/>
          <el-table-column :formatter="decodeBase64Formatter" :label="$t('device.name')" prop="device_name" min-width="180px" align="center"/>
          <el-table-column :label="$t('device.sn')" prop="sn" width="160px" align="center"/>
          <el-table-column :formatter="decodeBase64Formatter" :label="$t('device.area')" prop="addr_more_info" width="160px" align="center"/>
          <el-table-column :formatter="deviceGroupFormatter" :label="$t('device.group')" prop="group_id" width="160px" align="center"/>
          <el-table-column :label="$t('device.version')" prop="addtion.version" width="140px" align="center"/>
          <el-table-column :formatter="decodeBase64Formatter" :label="$t('device.commit')" prop="commit" min-width="180px" align="center"/>
          <el-table-column :label="$t('device.operate')" align="center" width="220px" class-name="small-padding fixed-width" fixed="right">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="handleOpenDevice(scope.row)">{{ $t('device.open') }}</el-button>
              <el-button type="info" size="mini" @click="onUpdateDeviceClick(scope.row)">{{ $t('device.edit') }}</el-button>
              <el-button type="danger" size="mini" @click="handleUnbindDevice(scope.row)">{{ $t('device.unbind') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="deviceTotal>0" :total="deviceTotal" :page.sync="deviceQueryPage" :limit.sync="deviceQueryLimit" @pagination="getDeviceList"/>
      </el-col>
    </el-row>

    <el-dialog v-el-drag-dialog :visible.sync="dialogDeviceVisible" :title="dialogDeviceModel === 'bind' ? $t('device.bindDeviceTitle') : $t('device.updateDeviceTitle')" :close-on-click-modal="false">
      <el-form ref="form" :model="formDevice" label-width="100px">
        <el-form-item :label="$t('device.sn')">
          <el-input v-model="formDevice.sn" :readonly="dialogDeviceModel === 'update'"/>
        </el-form-item>
        <el-form-item :label="$t('device.group')">
          <el-cascader
            :options="groupTreeData"
            v-model="formDevice.path"
            :props="propsGroup"
            :show-all-levels="false"
            change-on-select
            style="width: 100%"/>
        </el-form-item>
        <el-form-item :label="$t('device.commit')">
          <el-input :rows="3" v-model="formDevice.commit" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogDeviceVisible = false">{{ $t('device.cancelButtonText') }}</el-button>
        <el-button type="primary" @click="handleDevice(dialogDeviceModel)">
          {{ dialogDeviceModel === 'bind' ? $t('device.bindButtonText') : $t('device.updateButtonText') }}
        </el-button>
      </span>
    </el-dialog>
    <el-dialog v-el-drag-dialog :visible.sync="dialogGroupVisible" :title="dialogGroupModel === 'create' ? $t('device.createGroupTitle') : $t('device.updateGroupTitle')" :close-on-click-modal="false">
      <el-form ref="form" :model="formGroup" label-width="100px">
        <el-form-item :label="$t('device.parentGroupName')">
          <el-cascader
            :options="groupTreeData"
            v-model="formGroup.path"
            :props="propsGroup"
            :show-all-levels="false"
            change-on-select
            style="width: 100%"/>
        </el-form-item>
        <el-form-item :label="$t('device.groupName')">
          <el-input v-model="formGroup.name" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogGroupVisible = false">{{ $t('device.cancelButtonText') }}</el-button>
        <el-button type="primary" @click="handleGroup(dialogGroupModel)">
          {{ dialogGroupModel === 'create' ? $t('device.createButtonText') : $t('device.updateButtonText') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import { scanGroup, createGroup, updateGroup, deleteGroup } from '@/api/group'
import { scanDevice, bindDevice, updateDevice, unbindDevice } from '@/api/device'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui

export default {
  components: { Pagination },
  directives: { elDragDialog },
  data() {
    return {
      deviceLoading: false,
      exportLoading: false,
      deviceList: null,
      deviceTotal: 0,
      deviceFilter: {
        groupId: 0,
        sn: '',
        state: 'all'
      },
      deviceQueryPage: 1,
      deviceQueryLimit: 10,
      deviceStateOptions: [{ key: 'all' }, { key: 'online' }, { key: 'offline' }],
      dialogDeviceVisible: false,
      dialogDeviceModel: '',
      formDevice: {
        sn: '',
        commit: '',
        path: []
      },
      groupLoading: false,
      groupFilter: '',
      groupMap: new Map(),
      dialogGroupVisible: false,
      dialogGroupModel: '',
      formGroup: {
        id: 0,
        name: '',
        path: []
      },
      propsGroup: {
        value: 'id',
        label: 'label',
        children: 'children'
      }
    }
  },
  computed: {
    ...mapGetters([
      'userinfo'
    ]),
    groupTreeData() {
      const data = []
      if (this.groupMap.has(0)) {
        data.push(this.groupMap.get(0))

        for (const [k, v] of this.groupMap) {
          if (k !== 0) {
            if (this.groupMap.has(v.parentId)) {
              if (!this.groupMap.get(v.parentId).children) {
                this.groupMap.get(v.parentId).children = []
              }
              this.groupMap.get(v.parentId).children.push(v)
            }
          }
        }
      }
      return data
    }
  },
  watch: {
    groupFilter(val) {
      this.$refs.groupTree.filter(val)
    }
  },
  async created() {
    await this.getGroupList()
    await this.getDeviceList()
  },
  methods: {
    async getGroupList() {
      this.groupLoading = true
      var map = new Map()
      map.set(0, {
        id: 0,
        parentId: 0,
        label: this.userinfo.company,
        children: []
      })
      const query = {
        position: 0,
        limit: 10,
        where: []
      }

      do {
        try {
          var response = await scanGroup(query)
          // console.log(response)
          if (response.results) {
            for (const v of response.results) {
              map.set(v.group_id, {
                id: v.group_id,
                parentId: v.parent_id,
                label: new Buffer(v.name, 'base64').toString()
                // children: []
              })
            }
          }

          query.position = response.position
        } catch (error) {
          this.$message.error(this.$t('device.scanGroupFailedTips'))
          break
        }
      } while (response.is_end === 0)

      this.groupMap = map
      this.groupLoading = false
    },
    getDeviceList() {
      this.deviceLoading = true
      const query = {
        position: (this.deviceQueryPage - 1) * this.deviceQueryLimit,
        limit: this.deviceQueryLimit,
        where: []
      }
      if (this.deviceFilter.sn) {
        const where = {
          name: 'sn',
          value: this.deviceFilter.sn,
          oper: 'eq'
        }
        query.where.push(where)
      }
      if (this.deviceFilter.state !== 'all') {
        const where = {
          name: 'state',
          value: this.deviceFilter.state === 'online' ? 0 : 1,
          oper: 'eq'
        }
        query.where.push(where)
      }

      scanDevice(query).then(response => {
        this.deviceTotal = response.tot_result_size
        this.deviceList = response.results
        // console.log(response)
        this.deviceLoading = false
      }).catch(error => {
        console.log(error)
        this.$message.error(this.$t('device.scanDeviceFailedTips'))
      })
    },
    getDeviceType(board_version) {
      if (!board_version) return ''

      var mask = 0x1
      mask = mask << 24
      var decode = parseInt(board_version)
      decode = mask | decode
      decode = decode.toString(2)

      var d_type = decode.substring(decode.length - 24, decode.length - 12)
      var g_d_type = parseInt(d_type, 2)

      var m_version = decode.substring(decode.length - 6)
      var g_m_version = parseInt(m_version, 2)

      if (g_d_type === 1 || (g_d_type === 2 && g_m_version !== 4)) {
        return 'T'
      } else if ((g_d_type === 2 && g_m_version === 4) || g_d_type === 3 && g_m_version === 6) {
        return 'X'
      } else if (g_d_type === 3) {
        if (board_version === 12293 || board_version === 12421 || board_version === 12357 || board_version === 12613 || board_version === 12677 || board_version === 12294) {
          return 'R1'
        } else if (board_version === 12295) {
          return 'C'
        } else {
          return 'R2'
        }
      }
      return ''
    },
    deviceTypeFormatter(row, column, cellValue, index) {
      return this.getDeviceType(cellValue)
    },
    deviceGroupFormatter(row, column, cellValue, index) {
      if (this.groupMap.has(cellValue)) {
        return this.groupMap.get(cellValue).label
      } else {
        return this.groupMap.get(0).label
      }
    },
    decodeBase64Formatter(row, column, cellValue, index) {
      if (cellValue) {
        return new Buffer(cellValue, 'base64').toString()
      } else {
        return ''
      }
    },
    handleFilter() {
      this.deviceQueryPage = 1
      this.getDeviceList()
    },
    handleOpenDevice(row) {
      const url = `${process.env.BASE_API}/pdns?sn=${row.sn}&port=80&type=url&userdata=pdns`
      window.open(url)
    },
    onBindDeviceClick() {
      this.dialogDeviceModel = 'bind'
      this.formDevice.sn = ''
      this.formDevice.commit = ''
      this.formDevice.path = [0]
      this.dialogDeviceVisible = true
    },
    onUpdateDeviceClick(row) {
      this.dialogDeviceModel = 'update'
      this.formDevice.sn = row.sn
      this.formDevice.commit = new Buffer(row.commit, 'base64').toString()

      var id = row.group_id
      var arr = []
      while (id > 0) {
        arr.push(id)
        var v = this.groupMap.get(id)
        id = v.parentId
      }
      this.formDevice.path = [0]
      this.formDevice.path.push(...arr.reverse())
      this.dialogDeviceVisible = true
    },
    handleDevice(model) {
      if (model === 'bind') {
        this.handleBindDevice()
      } else {
        this.handleUpdateDevice()
      }
    },
    handleBindDevice() {
      bindDevice({
        sn: this.formDevice.sn,
        groupId: this.formDevice.path.slice(-1)[0],
        commit: this.formDevice.commit
      }).then(response => {
        this.dialogDeviceVisible = false
        this.$message({
          type: 'success',
          message: this.$t('device.bindDeviceSucceedTips')
        })
        this.getDeviceList()
      }).catch(error => {
        console.log(error)
        this.$message.error(this.$t('device.bindDeviceFailedTips'))
      })
    },
    handleUpdateDevice() {
      updateDevice({
        sn: this.formDevice.sn,
        groupId: this.formDevice.path.slice(-1)[0],
        commit: this.formDevice.commit
      }).then(response => {
        this.dialogDeviceVisible = false
        this.$message({
          type: 'success',
          message: this.$t('device.updateDeviceSucceedTips')
        })
        this.getDeviceList()
      }).catch(error => {
        console.log(error)
        this.$message.error(this.$t('device.updateDeviceFailedTips'))
      })
    },
    handleUnbindDevice(row) {
      this.$confirm(this.$t('device.confirmUnbindTips'), this.$t('device.confirmTitle'), {
        confirmButtonText: this.$t('device.confirmButtonText'),
        cancelButtonText: this.$t('device.cancelButtonText'),
        type: 'warning'
      }).then(() => {
        unbindDevice(row.sn).then(response => {
          this.$message({
            type: 'success',
            message: this.$t('device.unbindDeviceSucceedTips')
          })
          this.getDeviceList()
        }).catch(error => {
          console.log(error)
          this.$message.error(this.$t('device.unbindDeviceFailedTips'))
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('device.cancelUnbindDeviceTips')
        })
      })
    },
    async handleExport() {
      this.exportLoading = true
      const list = []

      const query = {
        position: 0,
        limit: 10,
        where: []
      }
      if (this.deviceFilter.sn) {
        const where = {
          name: 'sn',
          value: this.deviceFilter.sn,
          oper: 'eq'
        }
        query.where.push(where)
      }
      if (this.deviceFilter.state !== 'all') {
        const where = {
          name: 'state',
          value: this.deviceFilter.state === 'online' ? 0 : 1,
          oper: 'eq'
        }
        query.where.push(where)
      }

      do {
        try {
          var response = await scanDevice(query)
          list.push(...response.results)
          query.position = response.position
        } catch (error) {
          this.$message.error(this.$t('device.exportFailedTips'))
          return
        }
      } while (response.is_end === 0)

      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [this.$t('device.id'), this.$t('device.sn'), this.$t('device.type'), this.$t('device.name'), this.$t('device.area'), this.$t('device.version'), this.$t('device.state')]
        const filterVal = ['id', 'sn', 'type', 'name', 'area', 'version', 'state']
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'export-' + moment().format('YYYYMMDDHHmmss')
        })
        this.exportLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'name') {
          return new Buffer(v.device_name, 'base64').toString()
        } else if (j === 'type') {
          if (v.addtion) {
            return this.getDeviceType(v.addtion.board_version)
          } else {
            return ''
          }
        } else if (j === 'area') {
          return new Buffer(v.addr_more_info, 'base64').toString()
        } else if (j === 'version') {
          if (v.addtion) {
            return v.addtion.version
          } else {
            return ''
          }
        } else if (j === 'state') {
          return v.state === 0 ? this.$t('device.online') : this.$t('device.offline')
        } else {
          return v[j]
        }
      }))
    },
    onCreateGroupClick(data) {
      this.showGroupDialog(data, 'create')
    },
    onUpdateGroupClick(data) {
      this.showGroupDialog(data, 'update')
    },
    showGroupDialog(data, model) {
      var id = data.id

      this.dialogGroupModel = model
      if (model === 'create') {
        this.formGroup.name = ''
      } else {
        this.formGroup.id = data.id
        this.formGroup.name = data.label
        id = data.parentId
      }

      var arr = []
      while (id > 0) {
        arr.push(id)
        var v = this.groupMap.get(id)
        id = v.parentId
      }
      this.formGroup.path = [0]
      this.formGroup.path.push(...arr.reverse())

      this.dialogGroupVisible = true
    },
    handleGroup(model) {
      if (model === 'create') {
        this.handleCreateGroup()
      } else {
        this.handleUpdateGroup()
      }
    },
    handleCreateGroup() {
      createGroup({
        name: this.formGroup.name,
        parentId: this.formGroup.path.slice(-1)[0]
      }).then(response => {
        this.dialogGroupVisible = false
        this.$message({
          type: 'success',
          message: this.$t('device.createGroupSucceedTips')
        })
        this.getGroupList()
      }).catch(error => {
        console.log(error)
        this.$message.error(this.$t('device.createGroupFailedTips'))
      })
    },
    handleUpdateGroup() {
      updateGroup({
        id: this.formGroup.id,
        name: this.formGroup.name,
        parentId: this.formGroup.path.slice(-1)[0]
      }).then(response => {
        this.dialogGroupVisible = false
        this.$message({
          type: 'success',
          message: this.$t('device.updateGroupSucceedTips')
        })
        this.getGroupList()
      }).catch(error => {
        console.log(error)
        this.$message.error(this.$t('device.updateGroupFailedTips'))
      })
    },
    handleDeleteGroup(data) {
      this.$confirm(this.$t('device.confirmDeleteGroupTips'), this.$t('device.confirmTitle'), {
        confirmButtonText: this.$t('device.confirmButtonText'),
        cancelButtonText: this.$t('device.cancelButtonText'),
        type: 'warning'
      }).then(() => {
        deleteGroup(data.id).then(response => {
          this.$message({
            type: 'success',
            message: this.$t('device.deleteGroupSucceedTips')
          })
          this.getGroupList()
        }).catch(error => {
          console.log(error)
          this.$message.error(this.$t('device.deleteGroupFailedTips'))
        })
      }).catch(() => {

      })
    },
    filterGroup(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    }
  }
}
</script>

<style scoped>
.state-icon {
  font-size: 20px;
  cursor: pointer;
  vertical-align: -5px !important;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
