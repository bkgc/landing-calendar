"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@/components/ui";
import type { AppointmentNotification } from "@/types/notification";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppointmentNotification[]>(
    [],
  );

  useEffect(() => {
    void fetch("/api/notifications")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) setNotifications(result.data);
      });
  }, []);

  const unread = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <Dropdown
      onOpenChange={(open) => {
        if (open) {
          setNotifications((current) =>
            current.map((notification) => ({ ...notification, read: true })),
          );
          void fetch("/api/notifications", { method: "PATCH" });
        }
      }}
    >
      <Tooltip content="Notificaciones">
        <DropdownTrigger>
          <Button
            isIconOnly
            aria-label="Notificaciones"
            className="text-[var(--app-muted)]"
            variant="light"
          >
            <Badge
              color="danger"
              content={unread}
              isInvisible={!unread}
              size="sm"
            >
              <Bell size={19} />
            </Badge>
          </Button>
        </DropdownTrigger>
      </Tooltip>
      <DropdownMenu
        aria-label="Últimas notificaciones"
        emptyContent="No tienes notificaciones"
      >
        {notifications.map((notification) => (
          <DropdownItem key={notification.id} description={notification.body}>
            {notification.title}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
