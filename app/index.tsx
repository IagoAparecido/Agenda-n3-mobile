import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isToday, parseISO } from "date-fns";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import {
  AddEventoContainer,
  Container,
  ContainerAgendamentosDia,
  ContainerEventos,
  ConteinerAgendamentos,
  HorarioAgendamentosDia,
  IconFechar,
  Input,
  ModalContainer,
  ModalContent,
  ModalTitle,
  TextAgendamentosDia,
  TextoEventos,
} from "./styles";

interface AgendaScreenProps {}

const AgendaScreen: React.FC<AgendaScreenProps> = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [newAppointmentDescription, setNewAppointmentDescription] =
    useState<string>("");
  const [markedDates, setMarkedDates] = useState<any>({});
  const [showInputs, setShowInputs] = useState<boolean>(false);
  const [selectedHour, setSelectedHour] = useState<string>("00");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [editingAppointment, setEditingAppointment] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    saveAppointments();
    updateMarkedDates();
  }, [appointments, selectedDate]);

  const loadAppointments = async () => {
    try {
      const storedAppointments = await AsyncStorage.getItem(
        "@MyApp:appointments"
      );
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    }
  };

  const saveAppointments = async () => {
    try {
      await AsyncStorage.setItem(
        "@MyApp:appointments",
        JSON.stringify(appointments)
      );
    } catch (error) {
      console.error("Erro ao salvar agendamentos:", error);
    }
  };

  const updateMarkedDates = () => {
    const marks: any = {};

    const today = new Date().toISOString().split("T")[0];
    marks[today] = { marked: true, dotColor: "blue" };

    appointments.forEach((appointment) => {
      marks[appointment.date] = { marked: true };
    });

    setMarkedDates(marks);
  };

  const handleDateSelect = (date: any) => {
    setSelectedDate(date.dateString);
    setShowModal(true);
  };

  const handleEditAppointment = (index: number) => {
    setEditingAppointment(index);
    setSelectedHour(appointments[index].time.split(":")[0]);
    setSelectedMinute(appointments[index].time.split(":")[1]);
    setNewAppointmentDescription(appointments[index].description);
    setShowInputs(true);
  };

  const handleAddAppointment = () => {
    const editedAppointment = {
      date: selectedDate,
      time: `${selectedHour}:${selectedMinute}`,
      description: newAppointmentDescription,
    };

    if (editingAppointment !== null) {
      const updatedAppointments = [...appointments];
      updatedAppointments[editingAppointment] = editedAppointment;
      setAppointments(updatedAppointments);
      setEditingAppointment(null);
    } else {
      setAppointments([...appointments, editedAppointment]);
    }

    setShowInputs(false);
    setShowModal(false);
  };

  const handleDeleteAppointment = (
    date: string,
    time: string,
    description: string
  ) => {
    const updatedAppointments = appointments.filter(
      (appointment) =>
        !(
          appointment.date === date &&
          appointment.time === time &&
          appointment.description === description
        )
    );
    setAppointments(updatedAppointments);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowInputs = () => {
    setShowInputs(!showInputs);
    setEditingAppointment(null);
  };

  return (
    <Container>
      <ContainerEventos>
        <TextoEventos>Eventos do Dia</TextoEventos>
        {appointments
          .filter((appointment) => isToday(parseISO(appointment.date)))
          .map((appointment, index) => (
            <ContainerAgendamentosDia key={index}>
              <HorarioAgendamentosDia>
                {appointment.time}
              </HorarioAgendamentosDia>
              <TextAgendamentosDia>
                {appointment.description}
              </TextAgendamentosDia>
            </ContainerAgendamentosDia>
          ))}
      </ContainerEventos>

      <Calendar
        onDayPress={handleDateSelect}
        markedDates={markedDates}
        markingType="period"
      />

      <Modal visible={showModal} animationType="slide">
        <ModalContainer>
          <IconFechar onPress={handleCloseModal}>
            <Text>
              <AntDesign name="back" size={28} color="black" />
            </Text>
          </IconFechar>
          <ModalContent>
            <ModalTitle>{selectedDate}</ModalTitle>
            {appointments
              .filter((appointment) => appointment.date === selectedDate)
              .map((appointment, index) => (
                <ConteinerAgendamentos key={index}>
                  <HorarioAgendamentosDia>
                    {appointment.time}
                  </HorarioAgendamentosDia>
                  <TextAgendamentosDia>
                    {appointment.description}
                  </TextAgendamentosDia>
                  <TouchableOpacity
                    onPress={() =>
                      handleDeleteAppointment(
                        appointment.date,
                        appointment.time,
                        appointment.description
                      )
                    }
                    style={styles.deleteButton}
                  >
                    <Text>
                      <Feather name="trash-2" size={24} color="red" />
                    </Text>
                  </TouchableOpacity>
                  {editingAppointment === null && (
                    <TouchableOpacity
                      onPress={() => handleEditAppointment(index)}
                      style={styles.editButton}
                    >
                      <Text>
                        <Feather name="edit" size={24} color="green" />
                      </Text>
                    </TouchableOpacity>
                  )}
                </ConteinerAgendamentos>
              ))}
          </ModalContent>
          <AddEventoContainer>
            <TouchableOpacity
              onPress={handleShowInputs}
              style={styles.addButton}
            >
              <Text>{showInputs ? "Cancelar" : "Adicionar Evento"}</Text>
            </TouchableOpacity>

            {showInputs && (
              <>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    selectedValue={selectedHour}
                    onValueChange={(itemValue) => setSelectedHour(itemValue)}
                  >
                    {Array.from({ length: 24 }, (_, i) =>
                      i.toString().padStart(2, "0")
                    ).map((hour) => (
                      <Picker.Item key={hour} label={hour} value={hour} />
                    ))}
                  </Picker>

                  <Picker
                    style={styles.picker}
                    selectedValue={selectedMinute}
                    onValueChange={(itemValue) => setSelectedMinute(itemValue)}
                  >
                    {Array.from({ length: 60 }, (_, i) =>
                      i.toString().padStart(2, "0")
                    ).map((minute) => (
                      <Picker.Item key={minute} label={minute} value={minute} />
                    ))}
                  </Picker>
                </View>

                <Input
                  placeholder="Descrição"
                  value={newAppointmentDescription}
                  onChangeText={(text) => setNewAppointmentDescription(text)}
                />
                <TouchableOpacity
                  onPress={handleAddAppointment}
                  style={styles.addButton}
                >
                  <Text>Salvar Evento</Text>
                </TouchableOpacity>
              </>
            )}
          </AddEventoContainer>
        </ModalContainer>
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "lightblue",
    padding: 10,
    textAlign: "center",
  },
  deleteButton: {
    padding: 10,
    position: "absolute",
    left: "90%",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  picker: {
    flex: 1,
    height: 50,
  },
  pickerLabel: {
    marginLeft: 10,
  },
  editButton: {
    padding: 10,
    position: "absolute",
    left: "80%",
  },
});

export default AgendaScreen;
