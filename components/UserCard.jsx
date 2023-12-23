import Image from 'next/image'
import React from 'react'

function UserCard(props) {
    const { data, roomSocketInfo, isCurrentPlayer } = props;
    const { username, socketId, isActivePlayer } = data;
    return (
        <div className="mb-1">
            <div className={`bg-white rounded-md flex p-3 w-full justify-around items-center ${roomSocketInfo.socketId === socketId && 'border-4 border-green-400'}`}>
                <div className="relative">
                    <Image
                        src="/assets/icons/user.svg"
                        width={50}
                        height={50}
                        alt="user_icon"
                    />
                    <div className={`active_user_icon ${!isActivePlayer && 'hidden'}`}>
                        <Image
                            src="/assets/images/pencil.png"
                            width={35}
                            height={35}
                            alt="current_player"
                        />
                    </div>
                    <div className="lead_user_icon">
                        <Image
                            src="/assets/icons/crown.svg"
                            width={25}
                            height={25}
                            alt="leader_crown"
                        />
                    </div>
                </div>
                <div className='flex flex-col justify-start items-start mx-3'>
                    <p className="text-ellipsis overflow-hidden username_text">
                        {username}
                    </p>
                    <p>
                        score
                    </p>
                </div>
                <div>
                    <span>#1</span>
                </div>
            </div>
        </div>
    )
}

export default UserCard