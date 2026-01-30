import { useEffect, useState } from "react";
import { getPeople } from "../api/api";
import type { Person } from "../api/type";

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  async function refreshPeople() {
    setLoading(true);
    try {
      const res = await getPeople();
      setPeople(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshPeople().catch(() => {});
  }, []);

  return { people, loading, refreshPeople };
}
