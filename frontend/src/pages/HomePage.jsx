import { useChatStore } from "../store/usechatStore"
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
const HomePage = () => {
  const {selectedUser} = useChatStore();
  return (
    <div className="h-screen bg-base-300">
      <div className="flex justify-center items-center pt-20 px4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)] ">
          <div className="flex h-full overflow-hidden rounded-lg">
            <Sidebar/>
            {!selectedUser?<NoChatSelected/>:<ChatContainer/>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage