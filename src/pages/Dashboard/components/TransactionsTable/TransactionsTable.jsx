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
      console.log('1: tx num = ' + txHashArr.length);
      this.setState({txFrom: { txHashArr, maxTxNum, fromHomePage: true }});
    });
  }

  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
  }

  render() {
    console.log('2: tx num = ' + this.state.txFrom.txHashArr.length);
    return (
      <div className="progress-table">
        <TransactionList txFrom={this.state.txFrom}/>
      </div>
    );
  }
}