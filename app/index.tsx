import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Button,
} from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isToday, parseISO, addMinutes, isBefore, format } from "date-fns";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";

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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const AgendaScreen: React.FC<AgendaScreenProps> = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>({});
  const [newAppointmentDescription, setNewAppointmentDescription] =
    useState<string>("");
  const [markedDates, setMarkedDates] = useState<any>({});
  const [showInputs, setShowInputs] = useState<boolean>(false);
  const [selectedHour, setSelectedHour] = useState<string>("00");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [editingAppointment, setEditingAppointment] = useState<number | null>(
    null
  );

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );

  const API_KEY = "941f281b8d94d7ce02451d1c05edd5c5";

  const formatarData = (data: Date | string) => {
    return format(new Date(data), "dd/MM/yyyy");
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permissão de localização não concedida");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      getWeatherData(latitude, longitude);
    } catch (error) {
      console.error("Erro ao obter localização do usuário:", error);
    }
  };

  const getWeatherData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error("Erro ao obter dados meteorológicos:", error);
    }
  };

  const getWeatherIcon = (weatherCondition: string) => {
    switch (weatherCondition.toLowerCase()) {
      case "clear":
        return (
          <MaterialCommunityIcons
            name="weather-sunny"
            size={30}
            color="yellow"
          />
        );
      case "clouds":
        return (
          <MaterialCommunityIcons
            name="weather-cloudy"
            size={30}
            color="gray"
          />
        );
      case "rain":
        return (
          <MaterialCommunityIcons name="weather-rainy" size={30} color="blue" />
        );
      default:
        return <AntDesign name="question" size={30} color="black" />;
    }
  };

  useEffect(() => {
    loadAppointments();
    getUserLocation();
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

    setNewAppointmentDescription("");
    setShowInputs(false);
    setShowModal(false);

    scheduleNotificationBeforeEvent(
      selectedDate,
      `${selectedHour}:${selectedMinute}`,
      newAppointmentDescription
    );
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

  const scheduleNotificationBeforeEvent = async (
    date: string,
    time: string,
    description: string
  ) => {
    const eventDateTime = new Date(`${date}T${time}`);
    const notificationDateTime = addMinutes(eventDateTime, -5);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Agenda",
        body: `Lembrete! Seu agendamento: '${description}' está prestes a começar!`,
        data: { event: { date, time, description } },
      },
      trigger: { date: notificationDateTime },
    });
  };

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "22e09165-975e-4942-b23d-956e5b76e6cb",
        })
      ).data;
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token!)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <Container>
      <ContainerEventos>
        <View>
          <TextoEventos>Eventos do Dia</TextoEventos>
          <View
            style={{
              position: "absolute",
              left: "70%",
              top: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {weatherData?.main && (
              <Text style={{ marginRight: 5, fontSize: 18 }}>
                {weatherData.main.temp}&deg;C
              </Text>
            )}
            {weatherData?.weather &&
              getWeatherIcon(weatherData.weather[0]?.main)}
          </View>
        </View>

        {appointments
          .filter((appointment) => isToday(parseISO(appointment.date)))
          .map((appointment, index) => (
            <ContainerAgendamentosDia key={index}>
              <TextAgendamentosDia>
                {appointment.description}
              </TextAgendamentosDia>
              <HorarioAgendamentosDia>
                {appointment.time}
              </HorarioAgendamentosDia>
            </ContainerAgendamentosDia>
          ))}

        {appointments.filter((appointment) =>
          isToday(parseISO(appointment.date))
        ).length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Nenhum evento agendado para hoje.
          </Text>
        )}
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
            <ModalTitle>{formatarData(selectedDate)}</ModalTitle>
            {appointments
              .filter((appointment) => appointment.date === selectedDate)
              .map((appointment, index) => (
                <ConteinerAgendamentos key={index}>
                  <TextAgendamentosDia>
                    {appointment.description}
                  </TextAgendamentosDia>
                  <HorarioAgendamentosDia>
                    {appointment.time}
                  </HorarioAgendamentosDia>
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
              style={showInputs ? styles.cancelButton : styles.addButton}
            >
              <Text style={styles.textButton}>
                {showInputs ? "Cancelar" : "Adicionar Evento"}
              </Text>
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
                  <Text style={styles.textButton}>Salvar Evento</Text>
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
    backgroundColor: "#2d6a4f",
    padding: 10,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#c32f27",
    padding: 10,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  deleteButton: {
    padding: 10,
    position: "absolute",
    left: "90%",
  },
  textButton: {
    fontWeight: "800",
    color: "#f1f1f1",
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
