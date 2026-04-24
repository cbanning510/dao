import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers';

const Proposals = ({ provider, dao, proposals, quorum, setIsLoading }) => {
  const [hasVoted, setHasVoted] = useState({});

  useEffect(() => {
    const checkVotes = async () => {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const results = {};
      for (const proposal of proposals) {
        const id = proposal.id.toString();
        results[id] = await dao.votes(address, proposal.id);
      }
      setHasVoted(results);
    };

    if (proposals.length > 0) checkVotes();
  }, [dao, proposals, provider]);

  const voteHandler = async (id) => {
    try {
      const signer = await provider.getSigner();
      console.log('signer', signer);
      const transaction = await dao.connect(signer).vote(id);
      console.log('transaction', transaction);
      await transaction.wait();
    } catch {
      window.alert('User rejected or transaction reverted');
    }

    setIsLoading(true);
  };

  const downVoteHandler = async (id) => {
    try {
      const signer = await provider.getSigner();
      console.log('dao interface:', dao.interface.functions);
      console.log('downVote fragment:', dao.interface.getFunction('downVote'));
      const transaction = await dao.connect(signer).downVote(id);
      console.log('transaction', transaction);
      await transaction.wait();
    } catch {
      window.alert('User rejected or transaction reverted');
    }

    setIsLoading(true);
  };

  return (
    <>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Proposal Name</th>
            <th>Recipient Address</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Total Votes</th>
            <th>Cast Vote</th>
            <th>Finalize</th>
            <th>Proposal Description</th>
            <th>Quorum</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal, index) => (
            <tr key={index}>
              <td>{proposal.id.toString()}</td>
              <td>{proposal.name}</td>
              <td>{proposal.recipient}</td>
              <td>{ethers.utils.formatUnits(proposal.amount, 'ether')} ETH</td>
              <td>{proposal.finalized ? 'Approved' : 'In Progress'}</td>
              <td>{proposal.votes.toString()}</td>
              <td>
                {!proposal.finalized && (
                  <div style={{ display: 'flex', gap: 8, flexDirection: 'row' }}>
                    <Button variant="primary" style={{ width: '100%' }} disabled={hasVoted[proposal.id.toString()]} onClick={() => voteHandler(proposal.id)}>
                      Vote
                    </Button>
                    <Button variant="danger" style={{ width: '100%' }} disabled={hasVoted[proposal.id.toString()]} onClick={() => downVoteHandler(proposal.id)}>
                      DownVote
                    </Button>
                  </div>
                )}
              </td>
              <td>
                {!proposal.finalized && proposal.votes > quorum && (
                  <Button variant="primary" style={{ width: '100%' }}>
                    Finalize
                  </Button>
                )}
              </td>
              <td>{proposal.description}</td>
              <td>{proposal.votes > quorum ? 'true' : 'false'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default Proposals;
