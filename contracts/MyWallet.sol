pragma solidity ^0.4.0;

import "./mortal.sol";

contract MyWallet is mortal {
    event receivedFunds(address indexed _from, uint256 _amount);
    event proposalReceived(address indexed _from, address indexed _to, string _reason);

    struct Proposal {
        address _from;
        address _to;
        uint256 _value;
        string _reason;
        bool _sent;
    }

    uint proposal_counter;
    mapping(uint => Proposal) m_proposals;

    function spendMoney(address _to, uint256 _value, string _reason) returns(uint256) {
        if (owner == msg.sender) {
            _to.transfer(_value);
        } else {
            proposal_counter++;
            m_proposals[proposal_counter] = Proposal(msg.sender, _to, _value, _reason, false);
            proposalReceived(msg.sender, _to, _reason);
            return proposal_counter;
        }
    }

    function confirmProposal(uint proposal_id) onlyowner returns(bool) {
        Proposal proposal = m_proposals[proposal_id];
        require(proposal._from != address(0));

        if (proposal._sent != true) {
            proposal._sent = true;
            proposal._to.transfer(proposal._value);
            return true;
        }
        return false;
    }

    function() payable {}
}