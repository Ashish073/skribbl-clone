"use client"

import { useEffect, useState } from 'react';
import { titleColor } from '@/constants/config';
import { useRouter } from 'next/navigation';
import { setRoomSocketInfo, createRoom } from '@/redux/slices/roomSlice';
import { useSelector, useDispatch } from 'react-redux';
import socket from '@/services/socket';
import Image from 'next/image';

function page() {
  const [pageTitle, setPageTitle] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();
  const roomSocketInfo = useSelector(state => state.roomSlice.value)
  const dispatch = useDispatch();

  function renderSiteTitle() {
    let characterArray = [];
    characterArray = "Depict".split('')?.map((character, index) => {
      return { character, color: titleColor[index] }
    })
    setPageTitle(characterArray);
  }

  function redirectToGame(id) {
    push(`/game/${id}`);
  }

  // const handleCreateRoom = () => {
  //   if (!username) return;
  //   try {
  //     setIsLoading(true);
  //     socket.emit('createRoom', username);
  //     socket.on('roomCreated', ({ socketId: newSocketId, roomId: newRoomId, roomData }) => {
  //       dispatch(setRoomSocketInfo({
  //         roomId: newRoomId,
  //         socketId: newSocketId,
  //         roomData
  //       }));
  //       redirectToGame(newRoomId);
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleCreateRoom = async () => {
    if (!username) return;
    try {
      const response = await dispatch(createRoom({ username }));
      redirectToGame(response.payload.roomId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
    return;
  }

  useEffect(() => {
    renderSiteTitle();

    return () => {
      socket.off('roomCreated')
    }
  }, []);

  if (isLoading) {
    return <div className=" flex justify-center items-center h-screen w-screen">
      <Image
        width={100}
        height={100}
        alt="loading"
        src="/assets/loader/loader.svg"
      />
    </div>
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row justify-between items-center">
      <div className="p-4 flex flex-col w-full justify-center items-center">
        <div>
          <p className='text-white text-3xl mb-4'>It's just a pictionary game.</p>
        </div>
        <Image
          src="/assets/gifs/draw.gif"
          alt="drawing"
          width={700}
          height={700}
          className="w-auto h-auto"
          priority={true}
        />
      </div>
      <div className="p-4"></div>
      <div className="flex flex-col justify-center items-center h-screen mx-auto my-auto bg-white w-half px-10">
        <span className="font-sil text-6xl">{
          pageTitle.map(letter => {
            return <span className="font-bold title_stroke" key={letter.character} style={{ color: `${letter.color}` }}>{letter.character}</span>
          })
        }</span>

        <section className="flex flex-col mt-11 p-3  rounded-md">
          <input type="text" placeholder="Enter your name" onChange={(e) => setUsername(e.target.value)} className="p-2 px-3 bg-gray-100 rounded-full username_input mb-5" />
          <button type="button" onClick={handleCreateRoom} className="capitalize text-lg create_room_btn font-exo text-white p-3 rounded-full btn_text_shadow hover:bg-green-700 active:bg-green-900">
            Create private room
          </button>
        </section>
      </div>
    </div>
  )
}

export default page;
