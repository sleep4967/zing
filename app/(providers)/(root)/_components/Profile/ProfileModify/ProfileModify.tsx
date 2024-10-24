"use client";

import supabase from "@/supabase/client";
import { useAuthStore } from "@/zustand/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { useState } from "react";

function ProfileModify() {
	const [imageFile, setImageFile] = useState<File | undefined>();
	const [profileDesc, setProfileDesc] = useState("");
	const [userName, setUserName] = useState("");
	const currentUser = useAuthStore((state) => state.currentUser);
	const queryClient = useQueryClient();

	const { data: response } = useQuery({
		queryKey: ["profile"],
		queryFn: async () =>
			await supabase
				.from("profile")
				.select("*")
				.eq("userId", currentUser!.id)
				.single(),
		enabled: !!currentUser,
	});
	//
	const { mutate: createProfile } = useMutation({
		mutationFn: async () =>
			await supabase
				.from("profile")
				.insert([{ profileDesc: profileDesc, userName: userName }])
				.eq("userId", currentUser!.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
	});
	const profile = response?.data;

	const handleClickCreateProfile = () => {
		createProfile();
	};

	const handleClickUpdateImage = async () => {
		if (!imageFile) return;
		const response = await supabase.auth.getUser();
		const user = response.data.user!;

		const extension = imageFile.name.split(".").slice(-1)[0];

		const { data } = await supabase.storage
			.from("profile_image")
			.upload(`${nanoid()}.${extension}`, imageFile, { upsert: true });

		// console.log(data);
		if (!data) return alert("이미지 저장에 실패했습니다.");

		const baseURL =
			"https://vcvunmefpfrcskztejms.supabase.co/storage/v1/object/public/";

		await supabase
			.from("profile")
			.update({
				profileImg: baseURL + data.fullPath,
				profileDesc,
				userName,
			})
			.eq("userId", user.id);

		await queryClient.invalidateQueries({ queryKey: ["profile"] });
	};

	return (
		<main>
			<div className="p-5">
				<section className="mt-20">
					{profile ? (
						<img src={`${profile.profileImg}`} className="" />
					) : (
						"현재 프로필 사진이 없습니다."
					)}
				</section>
			</div>
			<div className="text-white">
				<input
					type="text"
					className="border-black border-2 text-black"
					placeholder="프로필을 한줄로 소개해 주세요!"
					value={profileDesc}
					onChange={(e) => setProfileDesc(e.target.value)}
				/>
				<input
					type="text"
					className="border-black border-2 text-black"
					placeholder="당신의 닉네임을 적어주세요!"
					value={userName}
					onChange={(e) => setUserName(e.target.value)}
				/>
				<input
					type="file"
					className="border-black border-2 text-black"
					placeholder="당신의 프로필 이미지를 넣어주세요!"
					onChange={(e) => setImageFile(e.target.files?.[0])}
				/>

				{profile ? (
					<button
						onClick={handleClickUpdateImage}
						className="bg-black"
					>
						수정하기
					</button>
				) : (
					<button
						onClick={handleClickCreateProfile}
						className="bg-black"
					>
						프로필 생성하기
					</button>
				)}
			</div>
		</main>
	);
}

export default ProfileModify;