/* eslint no-mixed-operators:0 */
import React, { Component } from 'react';
import * as oexchain from 'oex-web3';

import TransactionList from '../../../../TransactionList';
import eventProxy from '../../../../utils/eventProxy';

export default class TransactionsTable extends Component {
  static displayName = 'TransactionsTable';

  constructor(props) {
    super(props);

    this.state = {
      txHashArr: [],
      current: 1,
      assetInfos: {},
      txFrom: { txHashArr: [], maxTxNum: 0, fromHomePage: true },
      intervalId: 0,
    };
  }

  componentDidMount() {
    eventProxy.on('updateBlocks', (blocks) => {
      const maxTxNum = 13;
      let txHashArr = [];
      for (let i = 0; i < blocks.length; i++) {
        txHashArr.push(...blocks[i].transactions);
        if (txHashArr.length > maxTxNum) {
          txHashArr = txHashArr.slice(0, maxTxNum);
          break;
        }
      }
      this.setState({txFrom: { txHashArr, maxTxNum, fromHomePage: true }});
    });
  }

  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
  }

  updateTxInfo = () => {
    oexchain.oex.getCurrentBlock(false).then(async (block) => {

      let txNum = 0;
      var maxTxNum = 20;
      if (this.state.txHashArr.length > 0) {
        txNum = this.state.txHashArr.length;
        if (txNum + block.transactions.length > maxTxNum) {
          const leftNum = txNum + block.transactions.length - maxTxNum;
          this.state.txHashArr = this.state.txHashArr.slice(0, txNum - leftNum);
        }
        this.state.txHashArr = [...block.transactions, ...this.state.txHashArr];
      } else {
        var curHeight = block.number;
        var maxLookbackNum = 20;
        
        for (var height = curHeight - 1; height > curHeight - maxLookbackNum && height > 0; height--) {
          if (txNum >= maxTxNum) {
            console.log('get tx from block:' + height + '~' + curHeight);
            break;
          }
          
          if (this.state.savedBlockNumbers[height]) break;
          this.state.savedBlockNumbers[block.number] = true;
          const blockInfo = await oexchain.oex.getBlockByNum(height, false);
          if (blockInfo == null || blockInfo.transactions == null) {
            continue;
          }
          for (let txHash of blockInfo.transactions) {
            this.state.txHashArr.push(txHash);
            txNum++;
            if (txNum >= maxTxNum) {
              break;
            }
          }
        }
      }
      
      this.setState({txFrom: { txHashArr: this.state.txHashArr, maxTxNum, fromHomePage: true }});
    });
  }

  render() {
    return (
      <div className="progress-table">
        <TransactionList txFrom={this.state.txFrom}/>
      </div>
    );
  }
}