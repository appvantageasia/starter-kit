{{/* Create chart name and version as used by the chart label. */}}
{{- define "app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Common labels */}}
{{- define "app.labels" -}}
helm.sh/chart: {{ include "app.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{ include "app.selectorLabels" . }}
{{- end }}

{{/* Selector labels */}}
{{- define "app.selectorLabels" -}}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* Generate config if defined */}}
{{- define "app.configValue" -}}
{{- if .Value }}
{{- printf "%s: %s" .Key ( .Value | quote ) | nindent 2 }}
{{- end }}
{{- end }}

{{/* Generate secret if defined */}}
{{- define "app.secretValue" -}}
{{- if .Value }}
{{- printf "%s: %s" .Key ( .Value | b64enc ) | nindent 2 }}
{{- end }}
{{- end }}

{{/* Generate replica for deployment based on pod scaler settings */}}
{{- define "app.deploymentReplicas" -}}
{{ if .enabled }}{{ .minReplicas }}{{ else }}1{{ end }}
{{- end }}

{{/* Generate image based on settings */}}
{{- define "app.image" -}}
{{- if .registry }}
{{- printf "%s/%s:%s" .registry .repository .tag -}}
{{- else -}}
{{- printf "%s:%s" .repository .tag -}}
{{- end -}}
{{- end -}}

{{/* Create the name of the service account to use */}}
{{- define "app.serviceAccountName" -}}
{{- if .Values.app.serviceAccount.create }}
{{- default .Release.Name .Values.app.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.app.serviceAccount.name }}
{{- end }}
{{- end }}
