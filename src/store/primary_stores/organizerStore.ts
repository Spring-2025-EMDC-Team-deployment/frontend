import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

interface Organizer {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  password?: string;
}

interface OrganizerState {
  allOrganizers: Organizer[];
  organizer: Organizer | null;
  isLoadingOrganizer: boolean;
  organizerError: string | null;
  fetchAllOrganizers: () => Promise<void>;
  fetchOrganizerById: (organizerId: number) => Promise<void>;
  createOrganizer: (newOrganizer: Omit<Organizer, "id">) => Promise<void>;
  editOrganizer: (editedOrganizer: Organizer) => Promise<void>;
  deleteOrganizer: (organizerId: number) => Promise<void>;
  organizerDisqualifyTeam: (
    teamId: number,
    organizer_disqualified: boolean
  ) => Promise<void>;
  clearOrganizer: () => void;
}

export const useOrganizerStore = create<OrganizerState>()(
  persist(
    (set) => ({
      allOrganizers: [],
      organizer: null,
      isLoadingOrganizer: false,
      organizerError: null,

      clearOrganizer: () => {
        set({ organizer: null, organizerError: null });
      },

      fetchAllOrganizers: async () => {
        set({ isLoadingOrganizer: true });
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/organizer/getAll/`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          });
          set({
            allOrganizers: response.data.organizers,
            organizerError: null,
          });
        } catch (error) {
          set({ organizerError: "Error fetching organizers: " + error });
          throw new Error("Error fetching organizers: " + error);
        } finally {
          set({ isLoadingOrganizer: false });
        }
      },

      fetchOrganizerById: async (organizerId: number) => {
        set({ isLoadingOrganizer: true });
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/organizer/get/${organizerId}/`,
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );
          set({ organizer: response.data.Organizer, organizerError: null });
        } catch (error) {
          set({ organizerError: "Error fetching organizer: " + error });
          throw new Error("Error fetching organizer: " + error);
        } finally {
          set({ isLoadingOrganizer: false });
        }
      },

      createOrganizer: async (newOrganizer: Omit<Organizer, "id">) => {
        set({ isLoadingOrganizer: true });
        try {
          const token = localStorage.getItem("token");
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/organizer/create/`,
            newOrganizer,
            {
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const createdOrganizer: Organizer = response.data;
          set((state) => ({
            allOrganizers: [...state.allOrganizers, createdOrganizer],
            organizerError: null,
          }));
        } catch (error) {
          set({ organizerError: "Error creating organizer: " + error });
          throw new Error("Error creating organizer: " + error);
        } finally {
          set({ isLoadingOrganizer: false });
        }
      },

      editOrganizer: async (editedOrganizer: Organizer) => {
        set({ isLoadingOrganizer: true });
        try {
          const token = localStorage.getItem("token");
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/organizer/edit/`, editedOrganizer, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });
          set((state) => ({
            allOrganizers: state.allOrganizers.map((org) =>
              org.id === editedOrganizer.id ? editedOrganizer : org
            ),
            organizerError: null,
          }));
        } catch (error) {
          set({ organizerError: "Error editing organizer: " + error });
          throw new Error("Error editing organizer: " + error);
        } finally {
          set({ isLoadingOrganizer: false });
        }
      },

      deleteOrganizer: async (organizerId: number) => {
        set({ isLoadingOrganizer: true });
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/organizer/delete/${organizerId}/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
          set((state) => ({
            allOrganizers: state.allOrganizers.filter(
              (org) => org.id !== organizerId
            ),
            organizerError: null,
          }));
        } catch (error) {
          set({ organizerError: "Error deleting organizer: " + error });
          throw new Error("Error deleting organizer: " + error);
        } finally {
          set({ isLoadingOrganizer: false });
        }
      },

      organizerDisqualifyTeam: async (
        teamId: number,
        organizer_disqualified: boolean
      ) => {
        set({ isLoadingOrganizer: true });
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/organizer/disqualifyTeam/`,
            { teamid: teamId, organizer_disqualified: organizer_disqualified },
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );
          set({ organizerError: null });
        } catch (error) {
          set({
            organizerError: "Error organizer disqualifying team: " + error,
          });
          throw new Error("Error organizer disqualifying team: " + error);
        } finally {
          set({ isLoadingOrganizer: false });
        }
      },
    }),
    {
      name: "organizer-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useOrganizerStore;
