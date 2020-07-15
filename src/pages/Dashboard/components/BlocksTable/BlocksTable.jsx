/* eslint no-mixed-operators:0 */
import React, { Component } from 'react';
import { Table, Progress, Feedback } from '@icedesign/base';
import { Button, Dialog } from '@alifd/next';
import IceContainer from '@icedesign/container';
import copy from 'copy-to-clipboard';
import * as oexchain from 'oex-web3';

import * as utils from '../../../../utils/utils';
import { T } from '../../../../utils/lang';
import BlockList from '../../../BlockList';

const block = require('./images/middle_icon_BK.png');

export default class BlocksTable extends Component {
  static displayName = 'BlocksTable';

  constructor(props) {
    super(props);

    this.state = {
      blockList: [],
      intervalId: 0,
      blockListVisible: false,
    };
  }

  componentDidMount() {
    this.updateBlockInfo();
    
    oexchain.oex.getChainConfig().then(chainConfig => {
      this.state.intervalId = setInterval(() => {
        this.updateBlockInfo();
      }, chainConfig.dposParams.blockInterval);
    });

  }

  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
  }

  updateBlockInfo = () => {
    oexchain.oex.getCurrentBlock(false).then(async(block) => {
      if (this.state.blockList.length > 0 && block.number <= this.state.blockList[0].number) {
        return;
      }
      this.state.blockList = [block, ...this.state.blockList];
      block['txn'] = block.transactions.length;
      let length = this.state.blockList.length;
      if (length < 18) {
        const lastBlock = this.state.blockList[length - 1];
        var startHeight = lastBlock.number - 1;
        for (var i = startHeight; i > startHeight - (18 - length) && i >= 0; i--) {
          var curBlockInfo = await oexchain.oex.getBlockByNum(i, false);
          curBlockInfo['txn'] = curBlockInfo.transactions.length;
          this.state.blockList.push(curBlockInfo);
        }
      } 
      while (length > 18) {
        this.state.blockList.pop();
        length = this.state.blockList.length;
      }

      // const blockList = [];
      // var curHeight = block.number;
      // for (var i = curHeight; i > curHeight - 18 && i >= 0; i--) {
      //   var curBlockInfo = await oexchain.oex.getBlockByNum(i, false);
      //   curBlockInfo['txn'] = curBlockInfo.transactions.length;
      //   blockList.push(curBlockInfo);
      // }
      this.setState({
        blockList: this.state.blockList,
      });
    });
  }

  renderCellProgress = value => (
    <Progress showInfo={false} percent={parseInt(value, 10)} />
  );

  renderSize = value => {

  }
  copyValue = (value) => {
    copy(value);
    Feedback.toast.success(T('已复制到粘贴板'));
  }

  renderHash = (value) => {
    const displayValue = value.substr(0, 6) + '...' + value.substr(value.length - 6);
    return <address title={T('点击可复制')} onClick={ () => this.copyValue(value) }>{displayValue}</address>;
  }

  renderTimeStamp = (value) => {
    return utils.getValidTime(value);
  }

  renderHeader = () => {
    return <img src={block}></img>
  }

  renderBlockInfo = (value, index, record) => {
    const localTime = utils.getValidTime(record.timestamp);
    return (<div>
        <div>
          {T('矿工') + ' '}<font style={{color: '#5c67f2'}}>{record.miner}</font>
        </div>
        <div>
          <font style={{color: '#5c67f2'}}>{record.txn}{T('条交易')}</font>{T('发生于')}{localTime}
        </div>
      </div>);
  }

  renderBlockNumber = (v) => {
    return <a href={'/#/Block?h=' + v} style={{color: '#5c67f2'}}>{v}</a>;
  }

  renderGas = (v) => {
    return T('Gas消耗') + ' ' + v;
  }

  render() {
    return (
      <div className="progress-table">
        <IceContainer className="tab-card" title={T("区块")}>
          <Table hasHeader={false} isZebra={false}  hasBorder={false}
            dataSource={this.state.blockList}
            primaryKey="number"
            language={T('zh-cn')}
          >
            <Table.Column width={100} cell={this.renderHeader.bind(this)}/>
            <Table.Column title={T("高度")} dataIndex="number" width={100} cell={this.renderBlockNumber.bind(this)}/>
            <Table.Column title={T("详情")} dataIndex="number" width={200} cell={this.renderBlockInfo.bind(this)}/>
            <Table.Column title={T("Gas消耗")} dataIndex="gasUsed" width={100} cell={this.renderGas.bind(this)}/>

            {/* <Table.Column title={T("时间")} dataIndex="timestamp" width={150} cell={this.renderTimeStamp.bind(this)}/>
            <Table.Column title={T("Hash")} dataIndex="hash" width={150} cell={this.renderHash.bind(this)}/>
            <Table.Column title={T("交易数")} dataIndex="txn" width={100} />
            <Table.Column title={T("区块大小(B)")} dataIndex="size" width={100}/>
            <Table.Column title={T("生产者")} dataIndex="miner" width={100} /> */}
          </Table>
          <Button type='primary' 
                  style={{width: '100%', height: '40px', background: 'rgb(239,240,255)', color: '#5c67f2'}}
                  onClick={() => {
                    this.setState({blockListVisible: true});
                  }}>
            {T('查看所有区块')}
          </Button>
        </IceContainer>
        <Dialog language={T('zh-cn')} style={{ width: '1000px', height: '80%', marginTop: '-50px'}}
          visible={this.state.blockListVisible}
          shouldUpdatePosition={true}
          title={T("全部区块")}
          closeable="esc,close"
          onOk={() => {this.setState({blockListVisible: false})}}
          onCancel={() => {this.setState({blockListVisible: false})}}
          onClose={() => {this.setState({blockListVisible: false})}}
          footer={<view></view>}
        >
          <BlockList />
        </Dialog>
      </div>
    );
  }
}

const styles = {
  paginationWrapper: {
    display: 'flex',
    padding: '20px 0 0 0',
    flexDirection: 'row-reverse',
  },
};
