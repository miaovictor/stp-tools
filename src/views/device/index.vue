<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="deviceFilter.sn"
        :placeholder="$t('device.sn')"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="deviceFilter.state"
        :placeholder="$t('device.state')"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in deviceStateOptions"
          :key="item.key"
          :label="$t(`device.${item.key}`)"
          :value="item.key"
        />
      </el-select>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('device.search') }}</el-button>
      <el-button
        :loading="exportLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleExport"
      >{{ $t('device.export') }}</el-button>
      <!-- <el-input
        :placeholder="$t('table.title')"
        v-model="listQuery.title"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.importance"
        :placeholder="$t('table.importance')"
        clearable
        style="width: 90px"
        class="filter-item"
      >
        <el-option
          v-for="item in importanceOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
      <el-select
        v-model="listQuery.type"
        :placeholder="$t('table.type')"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.key"
          :label="item.display_name+'('+item.key+')'"
          :value="item.key"
        />
      </el-select>
      <el-select
        v-model="listQuery.sort"
        style="width: 140px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('table.search') }}</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t('table.add') }}</el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >{{ $t('table.export') }}</el-button>
      <el-checkbox
        v-model="showReviewer"
        class="filter-item"
        style="margin-left:15px;"
        @change="tableKey=tableKey+1"
      >{{ $t('table.reviewer') }}</el-checkbox>-->
    </div>

    <el-table
      v-loading="listLoading"
      :data="deviceList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        :label="$t('device.id')"
        prop="id"
        sortable="custom"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('device.state')"
        width="100px"
        align="center"
      >
        <template slot-scope="scope">
          <!-- <span>{{ scope.row.state }}</span> -->
          <svg-icon
            :icon-class="scope.row.state === 0 ? 'online' : 'offline'"
            class="state-icon"
          />
        </template>
      </el-table-column>

      <el-table-column
        :formatter="deviceTypeFormatter"
        :label="$t('device.type')"
        prop="addtion.board_version"
        width="100px"
        align="center"
      />
      <el-table-column
        :formatter="decodeBase64Formatter"
        :label="$t('device.name')"
        prop="device_name"
        min-width="200px"
        align="center"
      />
      <el-table-column
        :label="$t('device.sn')"
        prop="sn"
        width="200px"
        align="center"
      />
      <el-table-column
        :formatter="decodeBase64Formatter"
        :label="$t('device.area')"
        prop="addr_more_info"
        width="200px"
        align="center"
      />
      <el-table-column
        :label="$t('device.version')"
        prop="addtion.version"
        width="200px"
        align="center"
      />
      <el-table-column
        :label="$t('device.operate')"
        align="center"
        width="200"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleOpen(scope.row)"
          >{{ $t('device.open') }}</el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleUnbind(scope.row)"
          >{{ $t('device.unbind') }}
          </el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column
        :label="$t('table.title')"
        min-width="150px"
      >
        <template slot-scope="scope">
          <span
            class="link-type"
            @click="handleUpdate(scope.row)"
          >{{ scope.row.title }}</span>
          <el-tag>{{ scope.row.type | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.author')"
        width="110px"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="showReviewer"
        :label="$t('table.reviewer')"
        width="110px"
        align="center"
      >
        <template slot-scope="scope">
          <span style="color:red;">{{ scope.row.reviewer }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.importance')"
        width="80px"
      >
        <template slot-scope="scope">
          <svg-icon
            v-for="n in +scope.row.importance"
            :key="n"
            icon-class="star"
            class="meta-item__icon"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.readings')"
        align="center"
        width="95"
      >
        <template slot-scope="scope">
          <span
            v-if="scope.row.pageviews"
            class="link-type"
            @click="handleFetchPv(scope.row.pageviews)"
          >{{ scope.row.pageviews }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.status')"
        class-name="status-col"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.actions')"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >{{ $t('table.edit') }}</el-button>
          <el-button
            v-if="scope.row.status!='published'"
            size="mini"
            type="success"
            @click="handleModifyStatus(scope.row,'published')"
          >{{ $t('table.publish') }}
          </el-button>
          <el-button
            v-if="scope.row.status!='draft'"
            size="mini"
            @click="handleModifyStatus(scope.row,'draft')"
          >{{ $t('table.draft') }}
          </el-button>
          <el-button
            v-if="scope.row.status!='deleted'"
            size="mini"
            type="danger"
            @click="handleModifyStatus(scope.row,'deleted')"
          >{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>-->
    </el-table>
    <pagination
      v-show="deviceTotal>0"
      :total="deviceTotal"
      :page.sync="page"
      :limit.sync="deviceQuery.limit"
      @pagination="getDeviceList"
    />
  </div>
</template>

<script>
import moment from 'moment'
import { fetchList, unbind } from '@/api/device'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  components: { Pagination },
  data() {
    return {
      listLoading: false,
      exportLoading: false,
      deviceList: null,
      deviceTotal: 100,
      page: 1,
      deviceFilter: {
        sn: '',
        state: 'all'
      },
      deviceQuery: {
        position: 0,
        limit: 10,
        where: []
      },
      deviceStateOptions: [{ key: 'all' }, { key: 'online' }, { key: 'offline' }]
    }
  },
  created() {
    this.getDeviceList()
  },
  methods: {
    getDeviceList() {
      this.listLoading = true
      this.deviceQuery.position = (this.page - 1) * this.deviceQuery.limit
      this.deviceQuery.where = []
      if (this.deviceFilter.sn) {
        const where = {
          name: 'sn',
          value: this.deviceFilter.sn,
          oper: 'eq'
        }
        this.deviceQuery.where.push(where)
      }
      if (this.deviceFilter.state !== 'all') {
        const where = {
          name: 'state',
          value: this.deviceFilter.state === 'online' ? 0 : 1,
          oper: 'eq'
        }
        this.deviceQuery.where.push(where)
      }

      // console.log(`page: ${this.page} - position: ${this.deviceQuery.position} - limit: ${this.deviceQuery.limit}`)
      // console.log(this.deviceQuery)
      fetchList(this.deviceQuery).then(response => {
        this.deviceTotal = response.tot_result_size
        this.deviceList = response.results
        // console.log(response)
        this.listLoading = false
      }).catch(error => {
        console.log(error)
        this.$message.error(this.$t('device.fetchDeviceListFailedTips'))
      })
    },
    getDeviceType(board_version) {
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
    decodeBase64Formatter(row, column, cellValue, index) {
      if (cellValue) {
        return new Buffer(cellValue, 'base64').toString()
      } else {
        return ''
      }
    },
    handleFilter() {
      this.page = 1
      this.getDeviceList()
    },
    handleOpen(row) {
      const url = `${process.env.BASE_API}/pdns?sn=${row.sn}&port=80&type=url&userdata=pdns`
      window.open(url)
    },
    handleUnbind(row) {
      this.$confirm(this.$t('device.confirmUnbindTips'), this.$t('device.confirmUnbindTitle'), {
        confirmButtonText: this.$t('device.confirmButtonText'),
        cancelButtonText: this.$t('device.cancelButtonText'),
        type: 'warning'
      }).then(() => {
        unbind(row.sn).then(response => {
          this.$message({
            type: 'success',
            message: this.$t('device.unbindSucceedTips')
          })
          this.getDeviceList()
        }).catch(error => {
          console.log(error)
          this.$message.error(this.$t('device.unbindFailedTips'))
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('device.cancelUnbindTips')
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
          var response = await fetchList(query)
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
          return this.getDeviceType(v.addtion.board_version)
        } else if (j === 'area') {
          return new Buffer(v.addr_more_info, 'base64').toString()
        } else if (j === 'version') {
          return v.addtion.version
        } else if (j === 'state') {
          return v.state === 0 ? this.$t('device.online') : this.$t('device.offline')
        } else {
          return v[j]
        }
      }))
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
</style>
