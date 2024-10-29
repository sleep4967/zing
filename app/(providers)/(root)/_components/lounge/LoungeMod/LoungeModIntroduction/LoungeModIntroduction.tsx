"use client";

import api from "@/api/api";
import Input from "@/components/Input";
import supabase from "@/supabase/client";
import { queryClient } from "@/tanstack/query/client";
import { useAuthStore } from "@/zustand/auth.store";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface updateIntroduction {
  introduction: string;
  loungeId: number;
}

// loungeId가 null이라서 에러가 뜸 해결 필요

function LoungeModIntroduction() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [introduction, setIntroduction] = useState("");
  const params = useParams();

  // 카테고리 id 받아서 number형태로 변환
  console.log("params", params);

  const loungeId = Number(params.loungeId);
  const { mutate: updateIntroduction } = useMutation({
    mutationFn: async ({ introduction, loungeId }: updateIntroduction) =>
      api.lounges.updateLoungeIntroduction(
        currentUser!,
        introduction,
        loungeId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      const { data: lounges } = await supabase
        .from("lounges")
        .select("*")
        .eq("userId", currentUser!.id);
      console.log("lounges", lounges);

      if (!lounges) return;

      const lounge = lounges[loungeId];
    })();
  }, [currentUser]);

  const handleClickModIntroduction = () => {
    updateIntroduction({
      introduction: introduction,
      loungeId: loungeId!,
    });
  };

  return (
    <>
      <Input
        type="text"
        name="introduction"
        inputClassName="text-black"
        onChange={(e) => setIntroduction(e.target.value)}
      />

      <button
        className="rounded-full w-36 h-10 py-2 flex flex-row gap-x-2 justify-center items-center border"
        onClick={handleClickModIntroduction}
      >
        <p>내용 수정하기</p>
      </button>
    </>
  );
}

export default LoungeModIntroduction;