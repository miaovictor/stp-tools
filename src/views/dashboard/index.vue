<template>
  <div class="dashboard-container">
    <div class="header-container">
      <div class="left-container">
        <img
          src="static/img/avatar.gif"
          class="user-avatar"
        >
        <div class="info-wrapper">
          <div class="hello">
            <span>{{ userinfo.email + ', ' + $t('dashboard.welcome') }}</span>
          </div>
          <div class="intro">
            <span>{{ userinfo.company + ' | ' + userinfo.commit }}</span>
          </div>
        </div>
      </div>
      <dir class="right-container">
        <div class="device-wrapper">
          <div class="title">
            {{ $t('dashboard.deviceCount') }}
          </div>
          <div class="content">
            <p>
              {{ deviceOnlineCount }}
              <span>/ {{ deviceTotalCount }}</span>
            </p>
          </div>
        </div>
      </dir>
    </div>
  </div>
</template>

<script>
import { fetchList } from '@/api/device'
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {
      deviceTotalCount: 0,
      deviceOnlineCount: 0
    }
  },
  computed: {
    ...mapGetters([
      'userinfo'
    ])
  },

  created() {
    this.getDeviceCount()
  },
  methods: {
    getDeviceCount() {
      const query = {
        position: 0,
        limit: 0,
        where: []
      }
      fetchList(query).then(response => {
        this.deviceTotalCount = response.tot_result_size
      }).catch(error => {
        console.log(error)
      })

      query.where.push({
        name: 'state',
        value: 0,
        oper: 'eq'
      })
      fetchList(query).then(response => {
        this.deviceOnlineCount = response.tot_result_size
      }).catch(error => {
        console.log(error)
      })

      setTimeout(this.getDeviceCount, 5000)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-container {
  height: 100%;
  background-color: rgb(240, 242, 245);
  .header-container {
    height: 120px;
    background-color: rgb(255, 255, 255);
    .left-container {
      height: 120px;
      line-height: 120px;
      margin-left: 30px;
      float: left;
      .user-avatar {
        // cursor: pointer;
        width: 80px;
        height: 80px;
        border-radius: 40px;
        vertical-align: middle;
      }
      .info-wrapper {
        display: inline-block;
        margin-left: 20px;
        vertical-align: middle;
        .hello {
          font-size: 20px;
          line-height: 28px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
        }
        .intro {
          margin-top: 10px;
          font-size: 14px;
          line-height: 22px;
          color: rgba(0, 0, 0, 0.45);
        }
      }
    }
    .right-container {
      height: 120px;
      line-height: 120px;
      float: right;
      .device-wrapper {
        display: inline-block;
        margin-right: 30px;
        .title {
          font-size: 14px;
          line-height: 22px;
          color: rgba(0, 0, 0, 0.45);
          text-align: center;
        }
        .content {
          padding-top: 8px;
          p {
            font-size: 30px;
            line-height: 38px;
            color: rgba(0, 0, 0, 0.85);
            padding: 0;
            margin: 0;
            span {
              font-size: 20px;
              color: rgba(0, 0, 0, 0.45);
            }
          }
        }
      }
    }
  }
}
</style>
