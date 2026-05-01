import Modal from "../modal";
import Ticket from "../ticket";

export default function PrintTicketConfirm({ close, data }) {
  console.log(data);

  return (
    <Modal open={true} onClose={close}>
      <div>
        <Ticket sale={data} />
      </div>
    </Modal>
  );
}
