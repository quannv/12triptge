//TODO
/**
    gioi han so luong token
    co refund khong

    tao dapp để mua token thuận lợi
    tao node tren test net va main net (infura?)

    test tren test net
    verify source
 */

pragma solidity ^0.4.18;

import "../zeppelin-solidity/crowdsale/distribution/FinalizableCrowdsale.sol";
import "../zeppelin-solidity/crowdsale/validation/TimedCrowdsale.sol";
import "../zeppelin-solidity/crowdsale/Crowdsale.sol";
import "../zeppelin-solidity/token/ERC20/MintableToken.sol";

contract VNTripCrowdSale is FinalizableCrowdsale {

    // wallets address for 52% of TTR allocation
    address public walletTeamAdvisor;   //17.8% of the total number of TTR tokens will be allocated to the team
    address public walletIncentive;     //2% of the total number of TTR tokens will be allocated to
    address public walletBounties;      //12.2% of the total number of TTR tokens will be allocated to professional fees and Bounties
    address public walletReserve;       //20% of the total number of TTR tokens will be allocated to 12TRIP and as a reserve for the company to be used for future strategic plans for the created ecosystem

    uint256 public teamAdvisorTokens;
    uint256 public reserveTokens;
    //time to unlock tokens
    uint256 public timeUnlockTeamAdvisorTokens;
    uint256 public timeUnlockReserveTokens;

    //min/max per buy
    uint256 public minBuy;
    uint256 public maxBuy;

    function VNTripCrowdSale(
        uint256 _startTime,
        uint256 _endTime,
        address _wallet,
        address _walletTeamAdvisor,
        address _walletIncentive,
        address _walletBounties,
        address _walletReserve,
        uint256 _minBuy,
        uint256 _maxBuy,
        uint256 _rate,
        MintableToken _tokenAddress,
        uint256 _timeUnlockTeamAdvisorTokens,
        uint256 _timeUnlockReserveTokens) public Crowdsale(_rate, _wallet, _tokenAddress)
        TimedCrowdsale(_startTime, _endTime) {
            require(_wallet != address(0));
            require(_walletTeamAdvisor != address(0));
            require(_walletIncentive != address(0));
            require(_walletBounties != address(0));
            require(_walletReserve != address(0));
            require(_tokenAddress != address(0));

            walletTeamAdvisor = _walletTeamAdvisor;
            walletIncentive = _walletIncentive;
            walletBounties = _walletBounties;
            walletReserve = _walletReserve;

            minBuy = _minBuy;
            maxBuy = _maxBuy;

            token = _tokenAddress;

            timeUnlockTeamAdvisorTokens = _timeUnlockTeamAdvisorTokens;
            timeUnlockReserveTokens = _timeUnlockReserveTokens;
    }

    // =================================================================================================================
    //                                      Impl FinalizableCrowdsale
    // =================================================================================================================

    //@Override
    function finalization() internal onlyOwner {
        super.finalization();

        uint256 newTotalSupply = token.totalSupply().mul(100).div(48);

        // 17.8% of the total number of TTR tokens will be allocated to the team
        MintableToken(token).mint(this, newTotalSupply.mul(178).div(1000));
        teamAdvisorTokens = newTotalSupply.mul(178).div(1000);

        //2% of the total number of TTR tokens will be allocated to
        MintableToken(token).mint(walletIncentive, newTotalSupply.mul(20).div(1000));

        //12.2% of the total number of TTR tokens will be allocated to professional fees and Bounties
        MintableToken(token).mint(walletBounties, newTotalSupply.mul(122).div(1000));

        //20% of the total number of TTR tokens will be allocated to 12TRIP and as a reserve for the company to be used for future strategic plans for the created ecosystem
        MintableToken(token).mint(this, newTotalSupply.mul(200).div(1000));
        reserveTokens = newTotalSupply.mul(200).div(1000);        

        //MintFinished
        MintableToken(token).finishMinting();
        // transfer token ownership to crowdsale owner
        MintableToken(token).transferOwnership(owner);
    }

    // =================================================================================================================
    //                                      Impl Crowdsale
    // =================================================================================================================
    
    // low level token purchase function
    function _deliverTokens(address _beneficiary, uint256 _tokenAmount) internal {
        MintableToken(token).mint(_beneficiary, _tokenAmount);
    }
    
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
        super._preValidatePurchase(_beneficiary, _weiAmount);
        require(_weiAmount*rate >= minBuy);
        require(_weiAmount*rate <= maxBuy);
    }

    function unlockTeamAdvisorToken() public onlyOwner {
        require(block.timestamp >= timeUnlockTeamAdvisorTokens);
        require(teamAdvisorTokens > 0);
        uint256 numberTokens = teamAdvisorTokens;
        teamAdvisorTokens = 0;
        token.transfer(walletTeamAdvisor, numberTokens);
    }

    function unlockReserveToken() public onlyOwner {
        require(block.timestamp >= timeUnlockReserveTokens);
        require(reserveTokens > 0);
        uint256 numberTokens = reserveTokens;
        reserveTokens = 0;
        token.transfer(walletReserve, numberTokens);
    }
}